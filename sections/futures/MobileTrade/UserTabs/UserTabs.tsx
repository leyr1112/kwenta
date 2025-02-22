import React, { useMemo } from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { selectFuturesType } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import ConditionalOrdersTab from './ConditionalOrdersTab';
import OrdersTab from './OrdersTab';
import PositionsTab from './PositionsTab';
import TradesTab from './TradesTab';
import TransfersTab from './TransfersTab';

const TABS = [
	{
		title: 'Positions',
		component: <PositionsTab />,
	},
	{
		title: 'Pending',
		component: <OrdersTab />,
	},
	{
		title: 'Orders',
		component: <ConditionalOrdersTab />,
		type: 'cross_margin',
	},
	{
		title: 'Trades',
		component: <TradesTab />,
	},
	{
		title: 'Transfers',
		component: <TransfersTab />,
		type: 'isolated_margin',
	},
];

const UserTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);
	const accountType = useAppSelector(selectFuturesType);
	const filteredTabs = useMemo(() => TABS.filter(({ type }) => !type || type === accountType), [
		accountType,
	]);

	return (
		<Container>
			<UserTabsContainer>
				<TabButtonsContainer>
					{filteredTabs.map(({ title }, i) => (
						<TabButton
							key={title}
							title={title}
							active={activeTab === i}
							onClick={() => setActiveTab(i)}
							flat
						/>
					))}
				</TabButtonsContainer>
			</UserTabsContainer>
			<div>{filteredTabs[activeTab].component}</div>
		</Container>
	);
};

const Container = styled.div`
	min-height: 390px;
`;

const UserTabsContainer = styled.div`
	width: 100%;
	overflow: scroll;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`;

const TabButtonsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

export default UserTabs;
