PORT=3002 npx next dev -p 3002 > test-dev.log 2>&1 &
PID=$!
sleep 15
curl -s http://localhost:3002/en/explore > /dev/null
sleep 2
kill $PID
grep -i Error -A 10 -B 2 test-dev.log
