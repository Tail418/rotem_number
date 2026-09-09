#!/bin/bash
# 더블클릭하면 로뎀카페 주문번호 서버가 바로 실행됩니다.
cd "$(dirname "$0")"

echo "아인카페 서버를 시작합니다..."
echo ""

node server.js

echo ""
echo "서버가 종료되었습니다. 이 창을 닫아도 됩니다."
read -p "엔터 키를 누르면 창이 닫힙니다..."
