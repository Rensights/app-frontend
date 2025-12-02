#!/bin/bash
# Run this on the server to fix "invalid response from upstream server" error

echo "=== 🔍 DIAGNOSING UPSTREAM SERVER ERROR ==="
echo ""

echo "=== 1. Frontend Pod Status ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o wide
POD_NAME=$(kubectl get pod -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
POD_READY=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null)
POD_PHASE=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
echo "Pod Name: ${POD_NAME:-N/A}"
echo "Pod Ready: ${POD_READY:-N/A}"
echo "Pod Phase: ${POD_PHASE:-N/A}"

echo ""
echo "=== 2. Frontend Pod Logs (Last 50 lines) ==="
if [ -n "$POD_NAME" ]; then
  kubectl logs -n dev $POD_NAME --tail=50
else
  echo "❌ No pod found"
fi

echo ""
echo "=== 3. Frontend Pod Events ==="
if [ -n "$POD_NAME" ]; then
  kubectl describe pod -n dev $POD_NAME | grep -A 30 "Events:"
fi

echo ""
echo "=== 4. Frontend Service ==="
kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 5. Frontend Endpoints ==="
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 6. Testing Frontend Service Directly ==="
FRONTEND_SVC=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_SVC" ]; then
  SVC_IP=$(kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
  SVC_PORT=$(kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
  echo "Service: $FRONTEND_SVC"
  echo "ClusterIP: $SVC_IP"
  echo "Port: $SVC_PORT"
  echo "Testing connection..."
  kubectl run test-frontend-$(date +%s) --rm -i --tty --image=curlimages/curl --restart=Never -- curl -v -m 10 http://${SVC_IP}:${SVC_PORT}/ 2>&1 | head -30 || echo "❌ Failed to connect to service"
else
  echo "❌ Frontend service not found"
fi

echo ""
echo "=== 7. Testing Frontend Pod Directly ==="
if [ -n "$POD_NAME" ]; then
  echo "Testing pod directly on port 3000..."
  kubectl exec -n dev $POD_NAME -- curl -s -m 5 http://localhost:3000/ 2>&1 | head -20 || echo "❌ Pod not responding on port 3000"
fi

echo ""
echo "=== 8. Frontend Deployment Configuration ==="
kubectl get deployment -n dev -l app.kubernetes.io/name=frontend -o yaml | grep -A 20 "readinessProbe:\|livenessProbe:\|containerPort:"

echo ""
echo "=== 9. Kong Ingress Status ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o yaml | grep -A 10 "backend:"

echo ""
echo "=== 10. Kong Proxy Logs (Last 30 lines) ==="
KONG_POD=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || kubectl get pod -n kong-system -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$KONG_POD" ]; then
  KONG_NS=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || echo "kong-system")
  echo "Kong pod: $KONG_POD in namespace: $KONG_NS"
  kubectl logs -n $KONG_NS $KONG_POD --tail=30 | grep -i "frontend\|upstream\|invalid\|error" || echo "No relevant errors in Kong logs"
fi

echo ""
echo "=== 🔧 FIXING ISSUES ==="

# Check if pod is running
if [ "$POD_PHASE" != "Running" ] || [ "$POD_READY" != "true" ]; then
  echo "❌ Pod is not ready. Checking issues..."
  
  # Check if pod is crashing
  RESTART_COUNT=$(kubectl get pod -n dev $POD_NAME -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null || echo "0")
  if [ "$RESTART_COUNT" -gt "3" ]; then
    echo "⚠️  Pod has restarted $RESTART_COUNT times - likely crashing"
    echo "Checking logs for errors..."
    kubectl logs -n dev $POD_NAME --tail=100 | grep -i "error\|fatal\|exception" | head -20
  fi
  
  echo "Restarting deployment..."
  kubectl rollout restart deployment -n dev -l app.kubernetes.io/name=frontend
  echo "Waiting for pods to be ready (up to 3 minutes)..."
  kubectl wait --for=condition=ready pod -n dev -l app.kubernetes.io/name=frontend --timeout=180s || {
    echo "❌ Pods still not ready after 3 minutes"
    echo "Checking recent logs..."
    kubectl logs -n dev -l app.kubernetes.io/name=frontend --tail=50
  }
else
  echo "✅ Pod is running and ready"
  
  # Test if pod is actually responding
  if [ -n "$POD_NAME" ]; then
    echo "Testing pod health endpoint..."
    kubectl exec -n dev $POD_NAME -- curl -s -m 5 http://localhost:3000/ > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "✅ Pod is responding to requests"
    else
      echo "❌ Pod is not responding - may need more time to start"
      echo "Checking if Next.js is still starting..."
      kubectl logs -n dev $POD_NAME --tail=20 | grep -i "ready\|started\|listening"
    fi
  fi
fi

echo ""
echo "=== 11. Final Verification ==="
sleep 5
echo "Pod status:"
kubectl get pods -n dev -l app.kubernetes.io/name=frontend
echo ""
echo "Endpoints:"
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend
echo ""
echo "=== ✅ If pod is ready and endpoints exist, test frontend at: http://dev.72.62.40.154.nip.io:31416 ==="









