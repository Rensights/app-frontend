#!/bin/bash
# Run this script on the server to fix frontend issues

echo "=== 1. Checking Frontend Status ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend
kubectl get svc -n dev -l app.kubernetes.io/name=frontend
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "=== 2. Checking Pod Logs ==="
POD_NAME=$(kubectl get pod -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
  echo "Pod: $POD_NAME"
  kubectl logs -n dev $POD_NAME --tail=50
else
  echo "No frontend pod found"
fi

echo ""
echo "=== 3. Checking Pod Events ==="
if [ -n "$POD_NAME" ]; then
  kubectl describe pod -n dev $POD_NAME | grep -A 20 "Events:"
fi

echo ""
echo "=== 4. Checking Helm Release ==="
helm list -n dev | grep frontend || echo "No frontend release found"
helm get values frontend -n dev 2>/dev/null | grep -A 2 "image:" || echo "Could not get values"

echo ""
echo "=== 5. Fixing: Restart Frontend Deployment ==="
kubectl rollout restart deployment -n dev -l app.kubernetes.io/name=frontend || echo "No deployment to restart"

echo ""
echo "=== 6. Waiting for Pods to be Ready ==="
kubectl wait --for=condition=ready pod -n dev -l app.kubernetes.io/name=frontend --timeout=120s || echo "Pods not ready after 2 minutes"

echo ""
echo "=== 7. Final Status Check ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "=== 8. Testing Service Connection ==="
SVC_IP=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.clusterIP}' 2>/dev/null)
if [ -n "$SVC_IP" ]; then
  echo "Service IP: $SVC_IP"
  kubectl run test-frontend --rm -i --tty --image=curlimages/curl --restart=Never -- curl -s http://${SVC_IP}:3000/ | head -20 || echo "Failed to connect to service"
fi







