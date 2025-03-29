#!bin/sh
cd `dirname $0`
pnpm run env pnpm local post >out.log 2>err.log
