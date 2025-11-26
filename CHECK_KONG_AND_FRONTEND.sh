#!/bin/bash
# Run this on the server to check Kong and Frontend

echo "=== 1. Kong Ingress Controller Status ==="
kubectl get pods -n kong-system 2>/dev/null || kubectl get pods -A | grep kong
kubectl get svc -n kong-system 2>/dev/null || kubectl get svc -A | grep kong

echo ""
echo "=== 2. Kong Service Port ==="
kubectl get svc -n kong-system -o wide 2>/dev/null || kubectl get svc -A | grep kong | head -5

echo ""
echo "=== 3. Frontend Ingress Details ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 4. Frontend Service ==="
kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 5. Frontend Endpoints (CRITICAL) ==="
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o yaml

echo ""
echo "=== 6. Frontend Pods ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o wide

echo ""
echo "=== 7. Frontend Pod Status ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null && echo " (ready status)"
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].status.phase}' 2>/dev/null && echo " (phase)"

echo ""
echo "=== 8. Kong Routes (if using Kong Admin API) ==="
kubectl get kongroutes -n dev 2>/dev/null || echo "KongRoutes CRD not found or not in use"

echo ""
echo "=== 9. Test Frontend Service Directly ==="
FRONTEND_SVC=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_SVC" ]; then
  echo "Service: $FRONTEND_SVC"
  SVC_IP=$(kubectl get svc -n dev $FRONTEND_SVC -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
  echo "ClusterIP: $SVC_IP"
  kubectl run test-frontend-$(date +%s) --rm -i --tty --image=curlimages/curl --restart=Never -- curl -s -m 5 http://${SVC_IP}:3000/ | head -20 || echo "Failed to connect to service"
fi

echo ""
echo "=== 10. Check Kong Proxy Logs ==="
KONG_POD=$(kubectl get pod -n kong-system -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$KONG_POD" ]; then
  echo "Kong pod: $KONG_POD"
  kubectl logs -n kong-system $KONG_POD --tail=30 | grep -i "frontend\|ring-balancer\|peer" || echo "No relevant Kong logs found"
fi

