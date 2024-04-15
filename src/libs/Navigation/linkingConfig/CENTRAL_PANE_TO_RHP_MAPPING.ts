import type {CentralPaneName} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const CENTRAL_PANE_TO_RHP_MAPPING: Partial<Record<CentralPaneName, string[]>> = {
    [SCREENS.SETTINGS.PROFILE.ROOT]: [
        SCREENS.SETTINGS.PROFILE.DISPLAY_NAME,
        SCREENS.SETTINGS.PROFILE.CONTACT_METHODS,
        SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS,
        SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD,
        SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER,
        SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE,
        SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME,
        SCREENS.SETTINGS.PROFILE.STATUS,
        SCREENS.SETTINGS.PROFILE.PRONOUNS,
        SCREENS.SETTINGS.PROFILE.TIMEZONE,
        SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT,
        SCREENS.SETTINGS.PROFILE.LEGAL_NAME,
        SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH,
        SCREENS.SETTINGS.PROFILE.ADDRESS,
        SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY,
        SCREENS.SETTINGS.SHARE_CODE,
    ],
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE, SCREENS.SETTINGS.PREFERENCES.LANGUAGE, SCREENS.SETTINGS.PREFERENCES.THEME],
    [SCREENS.SETTINGS.WALLET.ROOT]: [
        SCREENS.SETTINGS.WALLET.DOMAIN_CARD,
        SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME,
        SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE,
        SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS,
        SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM,
        SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE,
        SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT,
        SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS,
        SCREENS.SETTINGS.WALLET.CARD_ACTIVATE,
        SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD,
        SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS,
    ],
    [SCREENS.SETTINGS.SECURITY]: [SCREENS.SETTINGS.TWO_FACTOR_AUTH, SCREENS.SETTINGS.CLOSE],
    [SCREENS.SETTINGS.ABOUT]: [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS],
    [SCREENS.SETTINGS.TROUBLESHOOT]: [SCREENS.SETTINGS.CONSOLE],
};

export default CENTRAL_PANE_TO_RHP_MAPPING;
