#!/bin/bash
# Comprehensive script to fix frontend on server
# Run this on the server: bash FIX_SERVER_FRONTEND.sh

set -e

echo "=== 🔍 FRONTEND DIAGNOSTIC & FIX SCRIPT ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== 1. Checking Frontend Pod Status ==="
PODS=$(kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o json 2>/dev/null)
if [ -z "$PODS" ] || [ "$PODS" == "null" ]; then
  echo -e "${RED}❌ No frontend pods found${NC}"
  exit 1
fi

POD_NAME=$(echo $PODS | jq -r '.items[0].metadata.name // empty')
POD_READY=$(echo $PODS | jq -r '.items[0].status.containerStatuses[0].ready // "false"')
POD_PHASE=$(echo $PODS | jq -r '.items[0].status.phase // "Unknown"')
RESTART_COUNT=$(echo $PODS | jq -r '.items[0].status.containerStatuses[0].restartCount // 0')

echo "Pod Name: $POD_NAME"
echo "Pod Phase: $POD_PHASE"
echo "Pod Ready: $POD_READY"
echo "Restart Count: $RESTART_COUNT"
kubectl get pods -n dev -l app.kubernetes.io/name=frontend -o wide

echo ""
echo "=== 2. Checking Frontend Pod Logs ==="
if [ -n "$POD_NAME" ]; then
  echo "Last 50 lines of logs:"
  kubectl logs -n dev $POD_NAME --tail=50 || echo "Could not fetch logs"
else
  echo -e "${RED}❌ No pod name found${NC}"
fi

echo ""
echo "=== 3. Checking Pod Events ==="
if [ -n "$POD_NAME" ]; then
  kubectl describe pod -n dev $POD_NAME | grep -A 30 "Events:" || echo "No events found"
fi

echo ""
echo "=== 4. Checking Frontend Service ==="
kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o wide
FRONTEND_SVC=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
SVC_IP=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.clusterIP}' 2>/dev/null)
SVC_PORT=$(kubectl get svc -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.ports[0].port}' 2>/dev/null)
echo "Service: $FRONTEND_SVC"
echo "ClusterIP: $SVC_IP"
echo "Port: $SVC_PORT"

echo ""
echo "=== 5. Checking Frontend Endpoints (CRITICAL) ==="
ENDPOINTS=$(kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].subsets[0].addresses[0].ip}' 2>/dev/null)
if [ -z "$ENDPOINTS" ]; then
  echo -e "${RED}❌ NO ENDPOINTS FOUND - This is the problem!${NC}"
  echo "Kong cannot route traffic without endpoints"
else
  echo -e "${GREEN}✅ Endpoints found: $ENDPOINTS${NC}"
fi
kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o yaml | grep -A 5 "addresses:" || echo "No addresses in endpoints"

echo ""
echo "=== 6. Testing Frontend Pod Directly ==="
if [ -n "$POD_NAME" ]; then
  echo "Testing pod on localhost:3000..."
  if kubectl exec -n dev $POD_NAME -- curl -s -m 5 http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Pod is responding on port 3000${NC}"
    kubectl exec -n dev $POD_NAME -- curl -s -m 5 http://localhost:3000/ | head -10
  else
    echo -e "${RED}❌ Pod is NOT responding on port 3000${NC}"
    echo "Checking if Next.js is still starting..."
    kubectl logs -n dev $POD_NAME --tail=20 | grep -i "ready\|started\|listening\|error" || echo "No relevant logs"
  fi
fi

echo ""
echo "=== 7. Testing Frontend Service ==="
if [ -n "$SVC_IP" ] && [ -n "$SVC_PORT" ]; then
  echo "Testing service at $SVC_IP:$SVC_PORT..."
  if kubectl run test-frontend-$(date +%s) --rm -i --tty --image=curlimages/curl --restart=Never -- curl -s -m 10 http://${SVC_IP}:${SVC_PORT}/ > /tmp/test-frontend-output.txt 2>&1; then
    echo -e "${GREEN}✅ Service is responding${NC}"
    cat /tmp/test-frontend-output.txt | head -20
    rm -f /tmp/test-frontend-output.txt
  else
    echo -e "${RED}❌ Service is NOT responding${NC}"
    cat /tmp/test-frontend-output.txt 2>/dev/null || echo "Could not test service"
    rm -f /tmp/test-frontend-output.txt
  fi
else
  echo -e "${RED}❌ Could not determine service IP/port${NC}"
fi

echo ""
echo "=== 8. Checking Kong Ingress ==="
kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o yaml | grep -A 15 "backend:" || echo "No ingress found or no backend configured"

echo ""
echo "=== 9. Checking Kong Status ==="
KONG_POD=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || kubectl get pod -n kong-system -l app=ingress-kong -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$KONG_POD" ]; then
  KONG_NS=$(kubectl get pod -A -l app=ingress-kong -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || echo "kong-system")
  echo "Kong pod: $KONG_POD in namespace: $KONG_NS"
  kubectl logs -n $KONG_NS $KONG_POD --tail=20 | grep -i "frontend\|upstream\|invalid\|ring-balancer" || echo "No relevant Kong errors"
else
  echo -e "${YELLOW}⚠️  Kong pod not found${NC}"
fi

echo ""
echo "=== 🔧 FIXING ISSUES ==="

# Fix 1: If no endpoints, restart deployment
if [ -z "$ENDPOINTS" ]; then
  echo -e "${YELLOW}⚠️  No endpoints found. Restarting deployment...${NC}"
  kubectl rollout restart deployment -n dev -l app.kubernetes.io/name=frontend
  echo "Waiting for rollout to complete (up to 5 minutes)..."
  kubectl rollout status deployment -n dev -l app.kubernetes.io/name=frontend --timeout=300s || {
    echo -e "${RED}❌ Rollout failed or timed out${NC}"
    echo "Checking deployment status..."
    kubectl get deployment -n dev -l app.kubernetes.io/name=frontend
  }
fi

# Fix 2: If pod is not ready, wait longer
if [ "$POD_READY" != "true" ]; then
  echo -e "${YELLOW}⚠️  Pod is not ready. Waiting up to 4 minutes...${NC}"
  kubectl wait --for=condition=ready pod -n dev -l app.kubernetes.io/name=frontend --timeout=240s || {
    echo -e "${RED}❌ Pod still not ready after 4 minutes${NC}"
    echo "Checking pod status..."
    kubectl get pods -n dev -l app.kubernetes.io/name=frontend
    echo ""
    echo "Recent logs:"
    kubectl logs -n dev -l app.kubernetes.io/name=frontend --tail=30
  }
fi

# Fix 3: If pod is crashing, check logs
if [ "$RESTART_COUNT" -gt "3" ]; then
  echo -e "${RED}⚠️  Pod has restarted $RESTART_COUNT times - checking for errors...${NC}"
  kubectl logs -n dev $POD_NAME --tail=100 | grep -i "error\|fatal\|exception" | head -20 || echo "No obvious errors in logs"
fi

echo ""
echo "=== 10. Final Verification ==="
sleep 5

echo "Pod status:"
kubectl get pods -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "Endpoints:"
ENDPOINTS_FINAL=$(kubectl get endpoints -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].subsets[0].addresses[0].ip}' 2>/dev/null)
if [ -n "$ENDPOINTS_FINAL" ]; then
  echo -e "${GREEN}✅ Endpoints: $ENDPOINTS_FINAL${NC}"
else
  echo -e "${RED}❌ Still no endpoints${NC}"
fi

echo ""
echo "Service:"
kubectl get svc -n dev -l app.kubernetes.io/name=frontend

echo ""
echo "=== 11. Testing Frontend Accessibility ==="
INGRESS_HOST=$(kubectl get ingress -n dev -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null)
KONG_SVC=$(kubectl get svc -A -l app=ingress-kong -o jsonpath='{.items[0].spec.ports[?(@.name=="proxy")].nodePort}' 2>/dev/null || kubectl get svc -A -l app=ingress-kong -o jsonpath='{.items[0].spec.ports[0].nodePort}' 2>/dev/null)

if [ -n "$INGRESS_HOST" ] && [ -n "$KONG_SVC" ]; then
  echo "Frontend URL: http://${INGRESS_HOST}:${KONG_SVC}"
  echo "Testing from inside cluster..."
  if kubectl run test-frontend-external-$(date +%s) --rm -i --tty --image=curlimages/curl --restart=Never -- curl -s -m 10 -H "Host: ${INGRESS_HOST}" http://${INGRESS_HOST}:${KONG_SVC}/ > /tmp/test-external.txt 2>&1; then
    echo -e "${GREEN}✅ Frontend is reachable via Kong!${NC}"
    cat /tmp/test-external.txt | head -20
    rm -f /tmp/test-external.txt
  else
    echo -e "${YELLOW}⚠️  Could not test external access from inside cluster${NC}"
    cat /tmp/test-external.txt 2>/dev/null || echo ""
    rm -f /tmp/test-external.txt
    echo ""
    echo "You can test from outside:"
    echo "curl -v http://${INGRESS_HOST}:${KONG_SVC}/"
  fi
else
  echo -e "${YELLOW}⚠️  Could not determine ingress host or Kong port${NC}"
  if [ -n "$INGRESS_HOST" ]; then
    echo "Ingress host: $INGRESS_HOST"
  fi
  if [ -n "$KONG_SVC" ]; then
    echo "Kong port: $KONG_SVC"
  fi
fi

echo ""
echo "=== ✅ DIAGNOSTIC COMPLETE ==="
echo ""
echo "Summary:"
echo "- Pod Ready: $POD_READY"
echo "- Endpoints: ${ENDPOINTS_FINAL:-NONE}"
echo "- Frontend URL: http://${INGRESS_HOST:-N/A}:${KONG_SVC:-N/A}"
echo ""
if [ "$POD_READY" == "true" ] && [ -n "$ENDPOINTS_FINAL" ]; then
  echo -e "${GREEN}✅ Frontend should be working!${NC}"
else
  echo -e "${RED}❌ Frontend has issues - check logs above${NC}"
fi









