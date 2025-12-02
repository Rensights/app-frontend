#!/bin/bash
# Run this on the server to check frontend status

echo "=== Frontend Pods in Dev ==="
kubectl get pods -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "=== Frontend Service in Dev ==="
kubectl get svc -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "=== Frontend Ingress in Dev ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "=== Frontend Pod Details ==="
kubectl describe pod -n dev -l app.kubernetes.io/name=frontend | grep -A 20 "State:\|Status:\|Events:" | head -40

echo ""
echo "=== Frontend Pod Logs (last 50 lines) ==="
kubectl logs -n dev -l app.kubernetes.io/name=frontend --tail=50 2>&1 | tail -50

echo ""
echo "=== Test Service Connection ==="
FRONTEND_POD=$(kubectl get pod -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_POD" ]; then
  echo "Testing connection to pod: $FRONTEND_POD"
  kubectl exec -n dev $FRONTEND_POD -- wget -q -O- http://localhost:3000/ | head -20 || echo "Failed to connect to pod"
else
  echo "No frontend pod found"
fi









