#!/bin/bash
# Diagnostic script to understand "invalid response from upstream server" error
# Run this on the server to see what's happening

echo "=== 🔍 DIAGNOSING 'Invalid Response from Upstream Server' Error ==="
echo ""
echo "This error means Kong is working, but the frontend service is not responding correctly."
echo ""

echo "=== 1. Frontend Pod Status ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o wide
POD_NAME=$(kubectl get pod -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
POD_READY=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null)
POD_PHASE=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.phase}' 2>/dev/null)

echo "Pod Name: ${POD_NAME:-NOT FOUND}"
echo "Pod Phase: ${POD_PHASE:-NOT FOUND}"
echo "Pod Ready: ${POD_READY:-NOT FOUND}"

if [ "$POD_READY" != "true" ]; then
  echo ""
  echo "⚠️  PROBLEM: Pod is NOT ready!"
  echo "   - This means Kong routes traffic but pod can't handle it"
  echo "   - Next.js may still be starting or health probe failing"
fi

echo ""
echo "=== 2. Frontend Endpoints (CRITICAL) ==="
ENDPOINTS=$(kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].subsets[0].addresses[0].ip}' 2>/dev/null)
if [ -z "$ENDPOINTS" ]; then
  echo "❌ PROBLEM: NO ENDPOINTS FOUND!"
  echo "   - Service has no healthy pods attached"
  echo "   - Kong can't route traffic without endpoints"
  echo "   - This is the most likely cause of the error"
else
  echo "✅ Endpoints found: $ENDPOINTS"
fi
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o yaml | grep -A 10 "addresses:" || echo "   No addresses in endpoints"

echo ""
echo "=== 3. Frontend Pod Logs (Last 30 lines) ==="
if [ -n "$POD_NAME" ]; then
  kubectl logs -n dev $POD_NAME --tail=30
  echo ""
  echo "--- Checking for Next.js startup messages ---"
  kubectl logs -n dev $POD_NAME | grep -i "ready\|started\|listening\|server\|port 3000" | tail -5 || echo "   No startup messages found"
else
  echo "❌ No pod found to check logs"
fi

echo ""
echo "=== 4. Testing Pod Directly (Most Important Test) ==="
if [ -n "$POD_NAME" ]; then
  echo "Testing: curl http://localhost:3000/ inside the pod..."
  if kubectl exec -n dev $POD_NAME -- curl -s -m 5 http://localhost:3000/ > /tmp/pod-test.txt 2>&1; then
    echo "✅ Pod IS responding on port 3000"
    echo "Response preview:"
    head -10 /tmp/pod-test.txt
    rm -f /tmp/pod-test.txt
  else
    echo "❌ PROBLEM: Pod is NOT responding on port 3000!"
    echo "   - Next.js is not running or not listening"
    echo "   - This is why Kong gets 'invalid response'"
    cat /tmp/pod-test.txt 2>/dev/null || echo "   Error details not available"
    rm -f /tmp/pod-test.txt
  fi
else
  echo "❌ No pod found to test"
fi

echo ""
echo "=== 5. Testing Frontend Service ==="
SVC_IP=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.clusterIP}' 2>/dev/null)
SVC_PORT=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.ports[0].port}' 2>/dev/null)
if [ -n "$SVC_IP" ] && [ -n "$SVC_PORT" ]; then
  echo "Testing service at $SVC_IP:$SVC_PORT..."
  if kubectl run test-svc-$(date +%s) --rm -i --tty --image=curlimages/curl --restart=Never -- curl -s -m 5 http://${SVC_IP}:${SVC_PORT}/ > /tmp/svc-test.txt 2>&1; then
    echo "✅ Service IS responding"
    head -10 /tmp/svc-test.txt
    rm -f /tmp/svc-test.txt
  else
    echo "❌ PROBLEM: Service is NOT responding"
    cat /tmp/svc-test.txt 2>/dev/null
    rm -f /tmp/svc-test.txt
  fi
fi

echo ""
echo "=== 6. Pod Events (Recent Issues) ==="
if [ -n "$POD_NAME" ]; then
  kubectl describe pod -n dev $POD_NAME | grep -A 20 "Events:" | tail -15 || echo "No events found"
fi

echo ""
echo "=== 7. Health Probe Status ==="
if [ -n "$POD_NAME" ]; then
  echo "Readiness probe:"
  kubectl get pod -n dev $POD_NAME -o jsonpath='{.status.containerStatuses[0].ready}' && echo " (true = ready, false = not ready)"
  echo ""
  echo "Liveness probe:"
  kubectl get pod -n dev $POD_NAME -o jsonpath='{.status.containerStatuses[0].started}' && echo " (true = started)"
fi

echo ""
echo "=== 8. Kong Logs (Last 10 lines with errors) ==="
KONG_POD=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$KONG_POD" ]; then
  KONG_NS=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || echo "kong-system")
  echo "Kong pod: $KONG_POD"
  kubectl logs -n $KONG_NS $KONG_POD --tail=50 | grep -i "frontend\|invalid\|upstream\|error\|9bcaba28aea10362a949f128d21f1938" | tail -10 || echo "   No relevant Kong errors found"
fi

echo ""
echo "=== 📋 SUMMARY ==="
echo ""
echo "The 'invalid response from upstream server' error means:"
echo "  1. ✅ Kong is working (receiving requests)"
echo "  2. ✅ Kong is trying to route to frontend service"
echo "  3. ❌ Frontend service is NOT responding correctly"
echo ""
echo "Most likely causes:"
if [ "$POD_READY" != "true" ]; then
  echo "  ❌ Pod is NOT ready (still starting or health probe failing)"
fi
if [ -z "$ENDPOINTS" ]; then
  echo "  ❌ No endpoints (service has no healthy pods)"
fi
if [ -n "$POD_NAME" ]; then
  if ! kubectl exec -n dev $POD_NAME -- curl -s -m 2 http://localhost:3000/ > /dev/null 2>&1; then
    echo "  ❌ Pod not responding on port 3000 (Next.js not running)"
  fi
fi

echo ""
echo "=== 🔧 RECOMMENDED FIXES ==="
echo ""
echo "If pod is NOT ready or has NO endpoints:"
echo "  1. Restart deployment:"
echo "     kubectl rollout restart deployment -n dev -l app.kubernetes.io/name=frontend"
echo ""
echo "  2. Wait for ready (Next.js needs 1-2 minutes):"
echo "     kubectl wait --for=condition=ready pod -n dev -l app.kubernetes.io/name=frontend --timeout=240s"
echo ""
echo "  3. Verify endpoints are created:"
echo "     kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend"
echo ""
echo "If pod is ready but not responding:"
echo "  1. Check pod logs for errors:"
echo "     kubectl logs -n dev -l app.kubernetes.io/name=frontend --tail=50"
echo ""
echo "  2. Check if Next.js started:"
echo "     kubectl logs -n dev -l app.kubernetes.io/name=frontend | grep -i 'ready\|started'"
echo ""









