prepare:
	echo $(date)
	npm run build
	rm -rf ./deploy && mkdir deploy
	cd ./deploy && mkdir shieldvault
	cd ./../../
	cd ./target && cp ./grat.contract.wasm ./../deploy/shieldvault/grat.contract.wasm && cp ./grat.contract.abi ./../deploy/shieldvault/grat.contract.abi
	
deploy-testnet:

	cd ./deploy/shieldvault && proton chain:set proton-test && proton contract:set shieldvault ./ 

deploy-mainnet:
	cd ./deploy/shieldvault && proton chain:set proton && proton contract:set shieldvault ./ 

feed-ram:
	proton chain:set proton-test && proton faucet:claim XPR shieldvault || echo "already claimed" && proton ram:buy shieldvault shieldvault 450000

testnet:
	make prepare && make deploy-testnet

publish:
	make prepare && make deploy-mainnet