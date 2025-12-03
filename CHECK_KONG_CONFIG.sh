#!/bin/bash
# Check Kong configuration for frontend
# Run this on the server

echo "=== 🔍 CHECKING KONG CONFIGURATION FOR FRONTEND ==="
echo ""

echo "=== 1. Frontend Ingress Configuration ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 2. Frontend Service Configuration ==="
kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 3. Frontend Service Endpoints ==="
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 4. Kong Ingress Controller Service ==="
kubectl get svc -A | grep kong
KONG_SVC=$(kubectl get svc -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
KONG_NS=$(kubectl get svc -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || echo "kong-system")
if [ -n "$KONG_SVC" ]; then
  echo "Kong service: $KONG_SVC in namespace: $KONG_NS"
  kubectl get svc -n $KONG_NS $KONG_SVC -o yaml
fi

echo ""
echo "=== 5. Kong Pod Status ==="
kubectl get pods -n $KONG_NS -l app=ingress-kong

echo ""
echo "=== 6. Testing Service from Kong Pod ==="
KONG_POD=$(kubectl get pod -n $KONG_NS -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
FRONTEND_SVC=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
FRONTEND_SVC_IP=$(kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
FRONTEND_SVC_PORT=$(kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)

if [ -n "$KONG_POD" ] && [ -n "$FRONTEND_SVC_IP" ]; then
  echo "Testing from Kong pod to frontend service..."
  echo "Frontend service: $FRONTEND_SVC ($FRONTEND_SVC_IP:$FRONTEND_SVC_PORT)"
  
  # Test direct service IP
  kubectl exec -n $KONG_NS $KONG_POD -- curl -v -s -m 10 http://${FRONTEND_SVC_IP}:${FRONTEND_SVC_PORT}/ 2>&1 | head -30
  
  # Test service DNS
  kubectl exec -n $KONG_NS $KONG_POD -- curl -v -s -m 10 http://${FRONTEND_SVC}.dev.svc.cluster.local:${FRONTEND_SVC_PORT}/ 2>&1 | head -30
else
  echo "Could not test - missing Kong pod or frontend service info"
fi

echo ""
echo "=== 7. Kong Routes Configuration (if using KongRoutes CRD) ==="
kubectl get kongroutes -n dev 2>/dev/null || echo "KongRoutes CRD not found"

echo ""
echo "=== 8. Kong Services Configuration (if using KongIngress CRD) ==="
kubectl get kongplugins -n dev 2>/dev/null || echo "KongPlugins not found"
kubectl get kongingress -n dev 2>/dev/null || echo "KongIngress not found"

echo ""
echo "=== 9. Kong Proxy Logs (Last 30 lines with frontend errors) ==="
if [ -n "$KONG_POD" ]; then
  kubectl logs -n $KONG_NS $KONG_POD --tail=50 | grep -i "frontend\|upstream\|invalid\|error\|9d094443aa6aa453c5d714150ec81422" || echo "No relevant errors in Kong logs"
fi

echo ""
echo "=== 10. Checking Ingress Annotations ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.annotations}' 2>/dev/null | jq . || echo "Could not get annotations"

echo ""
echo "=== 11. Testing Ingress Route Directly ==="
INGRESS_HOST=$(kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null)
KONG_NODEPORT=$(kubectl get svc -n $KONG_NS $KONG_SVC -o jsonpath='{.spec.ports[?(@.name=="proxy")].nodePort}' 2>/dev/null || kubectl get svc -n $KONG_NS $KONG_SVC -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)

if [ -n "$INGRESS_HOST" ] && [ -n "$KONG_NODEPORT" ]; then
  echo "Testing ingress route: http://${INGRESS_HOST}:${KONG_NODEPORT}/"
  curl -v -H "Host: ${INGRESS_HOST}" http://127.0.0.1:${KONG_NODEPORT}/ 2>&1 | head -40
fi

echo ""
echo "=== 12. Checking Service Selector Match ==="
echo "Service selector:"
kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.selector}' 2>/dev/null | jq .
echo ""
echo "Pod labels:"
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.labels}' 2>/dev/null | jq .

echo ""
echo "=== 📋 SUMMARY ==="
echo ""
echo "Check these Kong configuration issues:"
echo "1. Service backend in ingress matches service name"
echo "2. Service port matches (should be 3000)"
echo "3. Service has endpoints"
echo "4. Kong annotations are correct (strip-path, protocols)"
echo "5. Kong can reach the service from its pod"
echo ""









