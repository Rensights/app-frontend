#!/bin/bash
# Run this on the server to fix Kong ring-balancer error

echo "=== 🔍 DIAGNOSING KONG RING-BALANCER ERROR ==="
echo ""

echo "=== 1. Frontend Pod Status ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o wide
POD_READY=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null)
POD_PHASE=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
echo "Pod Ready: ${POD_READY:-N/A}"
echo "Pod Phase: ${POD_PHASE:-N/A}"

echo ""
echo "=== 2. Frontend Service ==="
kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o wide

echo ""
echo "=== 3. Frontend Endpoints (CRITICAL - Must have addresses) ==="
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o yaml | grep -A 10 "addresses:" || echo "❌ NO ENDPOINTS FOUND - This is the problem!"

echo ""
echo "=== 4. Frontend Ingress ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 5. Kong Ingress Controller Status ==="
kubectl get pods -A | grep kong || kubectl get pods -n kong-system 2>/dev/null
kubectl get svc -A | grep kong || kubectl get svc -n kong-system 2>/dev/null

echo ""
echo "=== 6. Kong Proxy Logs (Last 20 lines) ==="
KONG_POD=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || kubectl get pod -n kong-system -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$KONG_POD" ]; then
  KONG_NS=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || echo "kong-system")
  echo "Kong pod: $KONG_POD in namespace: $KONG_NS"
  kubectl logs -n $KONG_NS $KONG_POD --tail=20 | grep -i "frontend\|ring-balancer\|peer\|error" || echo "No relevant errors in Kong logs"
else
  echo "❌ Kong pod not found"
fi

echo ""
echo "=== 7. Testing Frontend Service Directly ==="
FRONTEND_SVC=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_SVC" ]; then
  SVC_IP=$(kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
  echo "Service: $FRONTEND_SVC"
  echo "ClusterIP: $SVC_IP"
  echo "Testing connection..."
  kubectl run test-frontend-$(date +%s) --rm -i --tty --image=curlimages/curl --restart=Never -- curl -s -m 5 http://${SVC_IP}:3000/ | head -10 || echo "❌ Failed to connect to service"
else
  echo "❌ Frontend service not found"
fi

echo ""
echo "=== 🔧 FIXING ISSUES ==="

# Check if endpoints exist
ENDPOINTS=$(kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].subsets[0].addresses[0].ip}' 2>/dev/null)
if [ -z "$ENDPOINTS" ]; then
  echo "❌ No endpoints found - pods are not ready"
  echo "Restarting deployment..."
  kubectl rollout restart deployment -n dev -l app.kubernetes.io/name=frontend
  echo "Waiting for pods to be ready (up to 3 minutes)..."
  kubectl wait --for=condition=ready pod -n dev -l app.kubernetes.io/name=frontend --timeout=180s || {
    echo "❌ Pods still not ready after 3 minutes"
    echo "Checking pod logs..."
    kubectl logs -n dev -l app.kubernetes.io/name=frontend --tail=50
    echo ""
    echo "Checking pod events..."
    kubectl describe pod -n dev -l app.kubernetes.io/name=frontend | grep -A 20 "Events:"
  }
else
  echo "✅ Endpoints exist: $ENDPOINTS"
fi

echo ""
echo "=== 8. Verifying Fix ==="
sleep 5
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend
echo ""
echo "=== ✅ If endpoints show addresses above, Kong should now work ==="
echo "=== Test frontend at: http://dev.72.62.40.154.nip.io:31416 ==="







