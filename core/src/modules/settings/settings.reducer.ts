import * as actions from './settings.actions';
import { SettingsPayload, SettingsKeys } from './settings.model';

export interface SettingsState {
    loaded: boolean;
    loading: boolean;
    layout: {
        showDrawer?: boolean
    };
    people: {
        list?: Array<string>
    };
    profile?: any;
    dashboard?: any;
}

const initialState: SettingsState = {
    loaded: false,
    loading: false,
    layout: {
        showDrawer: true
    },
    people: {
        list: ['email']
    },
    profile: {},
    dashboard: {}
};

export function settingsReducer(state: SettingsState = initialState,
                                action: actions.SettingActions): SettingsState {
    switch (action.type) {
        case actions.LIST_SETTINGS: {
            return Object.assign({}, state, {
                loading: true
            });
        }

        case actions.LIST_SETTINGS_SUCCESS: {
            const settings: any = action.payload;
            let people: any = state.people;

            if (settings.PEOPLE_LIST) {
                people = Object.assign({}, state.people, {
                    list: JSON.parse(settings.PEOPLE_LIST.value)
                });
            }

            return {
                loaded: true,
                loading: false,
                layout: settings.layout ? settings.layout : state.layout,
                people: people ? people : state.people,
                profile: settings.profile ? settings.profile : state.profile
            };
        }

        case actions.UPDATE_SETTINGS: {
            let peopleList: Array<string> = state.people.list;
            let settingPayload: SettingsPayload = action.payload;

            if (settingPayload.key === 'PEOPLE_LIST') {
                peopleList = settingPayload.data.map((s: string) => s);
            }

            return {
                loaded: true,
                loading: false,
                layout: state.layout,
                people: {
                    list: peopleList
                },
                profile: state.profile
            };
        }

        case actions.CLOSE_DRAWER: {
            return {
                loaded: false,
                loading: false,
                layout: {
                    showDrawer: false
                },
                people: state.people,
                profile: state.profile
            };
        }

        case actions.OPEN_DRAWER: {
            return {
                loaded: false,
                loading: false,
                layout: {
                    showDrawer: true
                },
                people: state.people,
                profile: state.profile
            };
        }

        default:
            return state;
    }
}

export const getLayoutSettings: any = (state: SettingsState) => state.layout;
export const getPeopleSettings: any = (state: SettingsState) => state.people;
export const getPeopleListSettings: any = (state: SettingsState) => state.people.list;
export const getProfileSettings: any = (state: SettingsState) => state.profile;

export const getShowDrawer: any = (state: SettingsState) => state.layout.showDrawer;
