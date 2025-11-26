#!/bin/bash
# Fix Kong timeout and connection issues for frontend
# Run this on the server

echo "=== 🔧 FIXING KONG CONFIGURATION FOR FRONTEND ==="
echo ""

# Get ingress name
INGRESS_NAME=$(kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$INGRESS_NAME" ]; then
  echo "❌ Frontend ingress not found"
  exit 1
fi

echo "Found ingress: $INGRESS_NAME"
echo ""

echo "=== Current Ingress Annotations ==="
kubectl get ingress -n dev $INGRESS_NAME -o jsonpath='{.items[0].metadata.annotations}' | jq . || echo "No annotations"

echo ""
echo "=== Adding Kong Timeout Annotations ==="

kubectl annotate ingress -n dev $INGRESS_NAME \
  konghq.com/connect-timeout=60000 \
  konghq.com/send-timeout=60000 \
  konghq.com/read-timeout=60000 \
  konghq.com/retries=5 \
  --overwrite

echo "✅ Added timeout annotations"

echo ""
echo "=== Updated Ingress Annotations ==="
kubectl get ingress -n dev $INGRESS_NAME -o jsonpath='{.items[0].metadata.annotations}' | jq .

echo ""
echo "=== Waiting for Kong to reload (10 seconds) ==="
sleep 10

echo ""
echo "=== Testing Frontend ==="
INGRESS_HOST=$(kubectl get ingress -n dev $INGRESS_NAME -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null)
KONG_SVC=$(kubectl get svc -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
KONG_NS=$(kubectl get svc -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || echo "kong-system")
KONG_PORT=$(kubectl get svc -n $KONG_NS $KONG_SVC -o jsonpath='{.spec.ports[?(@.name=="proxy")].nodePort}' 2>/dev/null || kubectl get svc -n $KONG_NS $KONG_SVC -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)

if [ -n "$INGRESS_HOST" ] && [ -n "$KONG_PORT" ]; then
  echo "Frontend URL: http://${INGRESS_HOST}:${KONG_PORT}/"
  echo "Testing..."
  curl -v -H "Host: ${INGRESS_HOST}" http://127.0.0.1:${KONG_PORT}/ 2>&1 | head -40
fi

echo ""
echo "=== ✅ Fix Complete ==="
echo ""
echo "If still getting errors, check:"
echo "1. Frontend service has endpoints: kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend"
echo "2. Frontend pod is ready: kubectl get pods -n dev -l app.kubernetes.io/name=frontend"
echo "3. Frontend is responding: kubectl exec -n dev <pod-name> -- curl http://localhost:3000/"
echo "4. Kong can reach service: kubectl exec -n <kong-ns> <kong-pod> -- curl http://<frontend-svc-ip>:3000/"

