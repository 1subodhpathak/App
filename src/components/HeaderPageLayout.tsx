import React, {ReactNode, useMemo} from 'react';
import {ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import FixedFooter from './FixedFooter';
import HeaderWithBackButton from './HeaderWithBackButton';
import HeaderWithBackButtonProps from './HeaderWithBackButton/types';
import ScreenWrapper from './ScreenWrapper';

type HeaderPageLayoutProps = ChildrenProps &
    HeaderWithBackButtonProps & {
        /** The background color to apply in the upper half of the screen. */
        backgroundColor?: string;

        /** A fixed footer to display at the bottom of the page. */
        footer?: ReactNode;

        /** The image to display in the upper half of the screen. */
        headerContent?: React.ReactNode;

        /** Style to apply to the header image container */
        headerContainerStyles?: StyleProp<ViewStyle>;

        /** Style to apply to the ScrollView container */
        scrollViewContainerStyles?: StyleProp<ViewStyle>;

        /** Style to apply to the children container */
        childrenContainerStyles?: StyleProp<ViewStyle>;

        /** Style to apply to the whole section container */
        style?: StyleProp<ViewStyle>;
    };

function HeaderPageLayout({
    backgroundColor,
    children,
    footer,
    headerContainerStyles,
    scrollViewContainerStyles,
    childrenContainerStyles,
    style,
    headerContent,
    ...rest
}: HeaderPageLayoutProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();
    const appBGColor = StyleUtils.getBackgroundColorStyle(theme.appBG);
    const {titleColor, iconFill} = useMemo(() => {
        const isColorfulBackground = (backgroundColor ?? theme.appBG) !== theme.appBG && (backgroundColor ?? theme.highlightBG) !== theme.highlightBG;
        return {
            titleColor: isColorfulBackground ? theme.textColorfulBackground : undefined,
            iconFill: isColorfulBackground ? theme.iconColorfulBackground : undefined,
        };
    }, [backgroundColor, theme.appBG, theme.highlightBG, theme.iconColorfulBackground, theme.textColorfulBackground]);

    return (
        // @ts-expect-error TODO: Remove once ScreenWrapper (https://github.com/Expensify/App/issues/25128) is migrated to TS
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(backgroundColor ?? theme.appBG)]}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom={false}
            offlineIndicatorStyle={[appBGColor]}
            testID={HeaderPageLayout.displayName}
        >
            {/** @ts-expect-error TODO: Remove once ScreenWrapper (https://github.com/Expensify/App/issues/25128) is migrated to TS */}
            {({safeAreaPaddingBottomStyle}) => (
                <HeaderWithBackButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    titleColor={titleColor}
                    iconFill={iconFill}
                >
                    <View style={[styles.flex1, appBGColor, !isOffline && footer !== null ? safeAreaPaddingBottomStyle : {}]}>
                        {/** Safari on ios/mac has a bug where overscrolling the page scrollview shows green background color. This is a workaround to fix that. https://github.com/Expensify/App/issues/23422 */}
                        {Browser.isSafari() && (
                            <View style={styles.dualColorOverscrollSpacer}>
                                <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(backgroundColor ?? theme.appBG)]} />
                                <View style={[isSmallScreenWidth ? styles.flex1 : styles.flex3, appBGColor]} />
                            </View>
                        )}
                        <ScrollView contentContainerStyle={[safeAreaPaddingBottomStyle, style, scrollViewContainerStyles]}>
                            {!Browser.isSafari() && <View style={styles.overscrollSpacer(backgroundColor ?? theme.appBG, windowHeight)} />}
                            <View style={[styles.alignItemsCenter, styles.justifyContentEnd, StyleUtils.getBackgroundColorStyle(backgroundColor ?? theme.appBG), headerContainerStyles]}>
                                {headerContent}
                            </View>
                            <View style={[styles.pt5, appBGColor, childrenContainerStyles]}>{children}</View>
                        </ScrollView>
                        {footer !== null && <FixedFooter>{footer}</FixedFooter>}
                    </View>
                </HeaderWithBackButton>
            )}
        </ScreenWrapper>
    );
}

HeaderPageLayout.displayName = 'HeaderPageLayout';

export default HeaderPageLayout;
