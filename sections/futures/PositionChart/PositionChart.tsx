import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import TVChart from 'components/TVChart';
import {
	selectConditionalOrdersForMarket,
	selectPosition,
	selectPositionPreviewData,
	selectSelectedMarketPositionHistory,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

export default function PositionChart() {
	const position = useAppSelector(selectPosition);
	const openOrders = useAppSelector(selectConditionalOrdersForMarket);
	const previewTrade = useAppSelector(selectTradePreview);
	const subgraphPosition = useAppSelector(selectSelectedMarketPositionHistory);
	const positionPreview = useAppSelector(selectPositionPreviewData);

	const [showOrderLines, setShowOrderLines] = useState(true);
	const [isChartReady, setIsChartReady] = useState(false);

	const modifiedAverage = positionPreview?.avgEntryPrice ?? zeroBN;

	const activePosition = useMemo(() => {
		if (!position?.position) {
			return null;
		}

		return {
			// As there's often a delay in subgraph sync we use the contract last
			// price until we get average price to keep it snappy on opening a position
			price: subgraphPosition?.avgEntryPrice ?? position.position.lastPrice,
			size: position.position.size,
			liqPrice: position.position?.liquidationPrice,
		};
	}, [subgraphPosition, position]);

	const onToggleLines = useCallback(() => {
		setShowOrderLines((show) => !show);
	}, [setShowOrderLines]);

	return (
		<Container visible={isChartReady}>
			<TVChart
				openOrders={openOrders}
				activePosition={activePosition}
				potentialTrade={
					previewTrade
						? {
								price: modifiedAverage || previewTrade.price,
								liqPrice: previewTrade.liqPrice,
								size: previewTrade.size,
						  }
						: null
				}
				onChartReady={() => {
					setIsChartReady(true);
				}}
				showOrderLines={showOrderLines}
				onToggleShowOrderLines={onToggleLines}
			/>
		</Container>
	);
}

const Container = styled.div<{ visible: boolean }>`
	min-height: calc(100% - 247px);
	max-height: calc(100% - 247px);
	height: calc(100% - 247px);
	background: ${(props) => props.theme.colors.selectedTheme.background};
	visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;
