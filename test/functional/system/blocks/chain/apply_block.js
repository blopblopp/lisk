/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const async = require('async');
const expect = require('chai').expect;
const lisk = require('lisk-js');
const accountFixtures = require('../../../../fixtures/accounts');
const randomUtil = require('../../../../common/utils/random');
const localCommon = require('../../common');

describe('system test (blocks) - chain/applyBlock', () => {
	let library;

	localCommon.beforeBlock('system_blocks_chain_apply_block', lib => {
		library = lib;
	});

	describe('applyBlock', () => {
		const transferAmount = 100000000 * 100;
		let block;
		let blockAccount1;
		let blockAccount2;
		let blockTransaction1;
		let blockTransaction2;

		beforeEach('create block', done => {
			blockAccount1 = randomUtil.account();
			blockAccount2 = randomUtil.account();
			blockTransaction1 = lisk.transaction.createTransaction(
				blockAccount1.address,
				transferAmount,
				accountFixtures.genesis.password
			);

			blockTransaction2 = lisk.transaction.createTransaction(
				blockAccount2.address,
				transferAmount,
				accountFixtures.genesis.password
			);

			blockTransaction1.senderId = accountFixtures.genesis.address;
			blockTransaction2.senderId = accountFixtures.genesis.address;
			localCommon.createValidBlock(
				library,
				[blockTransaction1, blockTransaction2],
				(err, b) => {
					block = b;
					done(err);
				}
			);
		});

		describe('undoUnconfirmedList', () => {
			let account1;
			let account2;
			let transaction1;
			let transaction2;

			before('with transactions in unconfirmed queue', done => {
				account1 = randomUtil.account();
				account2 = randomUtil.account();
				transaction1 = lisk.transaction.createTransaction(
					account1.address,
					transferAmount,
					accountFixtures.genesis.password
				);

				transaction2 = lisk.transaction.createTransaction(
					account2.address,
					transferAmount,
					accountFixtures.genesis.password
				);

				transaction1.senderId = accountFixtures.genesis.address;
				transaction2.senderId = accountFixtures.genesis.address;

				async.forEach(
					[transaction1, transaction2],
					(transaction, eachCb) => {
						localCommon.addTransaction(library, transaction, eachCb);
					},
					err => {
						expect(err).to.not.exist;
						localCommon.fillPool(library, done);
					},
					done
				);
			});

			it('should have transactions from pool in unconfirmed state', done => {
				done();
			});

			describe('after applying a new block', () => {
				beforeEach(done => {
					library.modules.blocks.chain.applyBlock(block, true, done);
				});

				it('should undo unconfirmed transactions', done => {
					async.forEach(
						[account1, account2],
						(account, eachCb) => {
							localCommon.getAccountFromDb(
								library,
								account.address,
								(err, accountRow) => {
									expect(transferAmount).to.equal(accountRow.u_balance);
									eachCb();
								}
							);
						},
						done
					);
				});
			});
		});

		describe('applyUnconfirmedStep', () => {
			describe('after applying a new block', () => {
				beforeEach(done => {
					library.modules.blocks.chain.applyBlock(block, true, done);
				});

				it('should applyUnconfirmedStep', done => {
					done();
				});
			});
		});

		describe('applyConfirmedStep', () => {
			describe('after applying a new block', () => {
				beforeEach(done => {
					library.modules.blocks.chain.applyBlock(block, true, done);
				});

				it('should applyConfirmedStep', done => {
					done();
				});
			});
		});

		describe('saveBlockStep', () => {
			describe('after applying a new block', () => {
				beforeEach(done => {
					library.modules.blocks.chain.applyBlock(block, true, done);
				});

				it('should saveBlockStep', done => {
					done();
				});
			});
		});
	});
});
