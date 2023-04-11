import { FC, memo } from 'react';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import NotificationContainer from 'constants/NotificationContainer';
import { MobileScreenContainer } from 'styles/common';

import Footer from './Footer';
import Header from './Header';
import MobileUserMenu from './Header/MobileUserMenu';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout: FC<AppLayoutProps> = memo(({ children }) => (
	<AppLayoutContainer>
		<DesktopOnlyView>
			<DesktopGridContainer>
				<Header />
				<main>{children}</main>
				<Footer />
			</DesktopGridContainer>
		</DesktopOnlyView>
		<MobileOrTabletView>
			<MobileScreenContainer>
				{children}
				<MobileUserMenu />
			</MobileScreenContainer>
		</MobileOrTabletView>
		<NotificationContainer />
	</AppLayoutContainer>
));

const AppLayoutContainer = styled.div`
	height: 100%;

	> div {
		height: 100%;
	}
`;

const DesktopGridContainer = styled.div`
	width: 100%;
	height: 100%;
	display: grid;
	grid-template: auto 1fr auto / 100%;

	> main {
		display: flex;
		min-height: 0;
		width: 100%;

		> div {
			width: 100%;
			height: 100%;
		}
	}
`;

export default AppLayout;
