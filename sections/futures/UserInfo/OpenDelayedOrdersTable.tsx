import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import Badge from 'components/Badge';
import { ButtonLoader } from 'components/Loader/Loader';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import {
	DEFAULT_DELAYED_CANCEL_BUFFER,
	DEFAULT_DELAYED_EXECUTION_BUFFER,
} from 'constants/defaults';
import useInterval from 'hooks/useInterval';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { FuturesMarketKey } from 'sdk/types/futures';
import { cancelDelayedOrder, executeDelayedOrder } from 'state/futures/actions';
import {
	selectIsCancellingOrder,
	selectIsExecutingOrder,
	selectOpenDelayedOrders,
	selectMarketAsset,
	selectMarkets,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatCurrency, suggestedDecimals } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import PositionType from '../PositionType';
import TableMarketDetails from './TableMarketDetails';

type CountdownTimers = Record<
	FuturesMarketKey,
	{
		timeToExecution: number;
		timePastExecution: number;
	}
>;

const OpenDelayedOrdersTable: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();
	const isL2 = useIsL2();

	const marketAsset = useAppSelector(selectMarketAsset);
	const openDelayedOrders = useAppSelector(selectOpenDelayedOrders);
	const futuresMarkets = useAppSelector(selectMarkets);
	const isCancelling = useAppSelector(selectIsCancellingOrder);
	const isExecuting = useAppSelector(selectIsExecutingOrder);

	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>();

	const rowsData = useMemo(() => {
		const ordersWithCancel = openDelayedOrders
			.map((o) => {
				const market = futuresMarkets.find((m) => m.market === o.marketAddress);
				const timer = countdownTimers ? countdownTimers[o.marketKey] : null;
				const order = {
					...o,
					sizeTxt: formatCurrency(o.asset, o.size.abs(), {
						currencyKey: getDisplayAsset(o.asset) ?? '',
						minDecimals: suggestedDecimals(o.size),
					}),
					timeToExecution: timer?.timeToExecution,
					timePastExecution: timer?.timePastExecution,
					show: !!timer,
					isStale:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution >
							DEFAULT_DELAYED_CANCEL_BUFFER +
								(o.isOffchain
									? market.settings.offchainDelayedOrderMaxAge
									: market.settings.maxDelayTimeDelta),
					isFailed:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution >
							DEFAULT_DELAYED_EXECUTION_BUFFER +
								(o.isOffchain
									? market.settings.offchainDelayedOrderMinAge
									: market.settings.minDelayTimeDelta),
					isExecutable:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution <=
							(o.isOffchain
								? market.settings.offchainDelayedOrderMaxAge
								: market.settings.maxDelayTimeDelta),
					totalDeposit: o.commitDeposit.add(o.keeperDeposit),
					onCancel: () => {
						dispatch(
							cancelDelayedOrder({
								marketAddress: o.marketAddress,
								isOffchain: o.isOffchain,
							})
						);
					},
					onExecute: () => {
						dispatch(
							executeDelayedOrder({
								marketKey: o.marketKey,
								marketAddress: o.marketAddress,
								isOffchain: o.isOffchain,
							})
						);
					},
				};
				return order;
			})
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1;
			});
		return ordersWithCancel;
	}, [openDelayedOrders, futuresMarkets, marketAsset, countdownTimers, dispatch]);

	useInterval(
		() => {
			const newCountdownTimers = rowsData.reduce((acc, order) => {
				const timeToExecution = Math.floor((order.executableAtTimestamp - Date.now()) / 1000);
				const timePastExecution = Math.floor((Date.now() - order.executableAtTimestamp) / 1000);

				// Only updated delayed orders
				acc[order.marketKey] = {
					timeToExecution: Math.max(timeToExecution, 0),
					timePastExecution: Math.max(timePastExecution, 0),
				};
				return acc;
			}, {} as CountdownTimers);
			setCountdownTimers(newCountdownTimers);
		},
		1000,
		[rowsData]
	);

	return (
		<Table
			data={rowsData}
			columnsDeps={[isCancelling, isExecuting]}
			highlightRowsOnHover
			showPagination
			rounded={false}
			noBottom={true}
			noResultsMessage={
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : (
					<TableNoResults>{t('futures.market.user.open-orders.table.no-result')}</TableNoResults>
				)
			}
			columns={[
				{
					Header: (
						<TableHeader>{t('futures.market.user.open-orders.table.market-type')}</TableHeader>
					),
					accessor: 'market',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<TableMarketDetails
								marketName={cellProps.row.original.market}
								infoLabel={cellProps.row.original.orderType}
								marketKey={cellProps.row.original.marketKey}
								badge={
									cellProps.row.original.isStale && (
										<ExpiredBadge color="red">
											{t('futures.market.user.open-orders.badges.expired')}
										</ExpiredBadge>
									)
								}
							/>
						);
					},
					sortable: true,
					width: 60,
				},
				{
					Header: <TableHeader>{t('futures.market.user.open-orders.table.side')}</TableHeader>,
					accessor: 'side',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								<PositionType side={cellProps.row.original.side} />
							</div>
						);
					},
					sortable: true,
					width: 40,
				},
				{
					Header: <TableHeader>{t('futures.market.user.open-orders.table.size')}</TableHeader>,
					accessor: 'size',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								<div>{cellProps.row.original.sizeTxt}</div>
							</div>
						);
					},
					sortable: true,
					width: 50,
				},
				{
					Header: <TableHeader>{t('futures.market.user.open-orders.table.status')}</TableHeader>,
					accessor: 'status',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								{cellProps.row.original.show &&
									(cellProps.row.original.isStale ? (
										<div>{t('futures.market.user.open-orders.status.expired')}</div>
									) : cellProps.row.original.isFailed ? (
										<div>{t('futures.market.user.open-orders.status.failed')}</div>
									) : (
										<div>{t('futures.market.user.open-orders.status.pending')}</div>
									))}
							</div>
						);
					},
					sortable: true,
					width: 50,
				},
				{
					Header: <TableHeader>{t('futures.market.user.open-orders.table.actions')}</TableHeader>,
					accessor: 'actions',
					Cell: (cellProps: CellProps<any>) => {
						return (
							<div>
								{cellProps.row.original.show &&
									cellProps.row.original.isStale &&
									(isCancelling ? (
										<ButtonLoader />
									) : (
										<CancelButton onClick={cellProps.row.original.onCancel}>
											{t('futures.market.user.open-orders.actions.cancel')}
										</CancelButton>
									))}
								{cellProps.row.original.show &&
									!cellProps.row.original.isStale &&
									cellProps.row.original.isFailed &&
									(isExecuting ? (
										<ButtonLoader />
									) : (
										<EditButton onClick={cellProps.row.original.onExecute}>
											{t('futures.market.user.open-orders.actions.execute')}
										</EditButton>
									))}
							</div>
						);
					},
					width: 50,
				},
			]}
		/>
	);
};

const EditButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.gray};
	height: 28px;
	min-width: 72px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.gray};
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
`;

const CancelButton = styled(EditButton)`
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	color: ${(props) => props.theme.colors.selectedTheme.red};

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.red};
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
`;

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
	margin-left: 6px;
`;

export default OpenDelayedOrdersTable;
