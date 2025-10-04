// my-profiles.service.ts
import { Injectable, Inject } from '@angular/core'
import {
    ProfilesService,
    AppService,
    ConfigService,
    NotificationsService,
    SelectorService,
    TranslateService,
    ProfileProvider,
    Profile,
    PartialProfile,
} from 'tabby-core'

import { ProfileSelectorComponent } from '../components/profileSelector.component'

@Injectable()
export class ProfilesServicesOverride extends ProfilesService {
    constructor(
        app: AppService,
        config: ConfigService,
        notifications: NotificationsService,
        selector: SelectorService,
        translate: TranslateService,
        @Inject(ProfileProvider) profileProviders: ProfileProvider<Profile>[],
    ) {
        super(app, config, notifications, selector, translate, profileProviders)
    }


    // override the method you want to intercept
    async showProfileSelector(): Promise<PartialProfile<Profile> | null> {

        // Accessing private members via type assertion to 'any'; hacky but works.
        const app = (this as any).app as AppService

        app.openNewTabRaw({
            type: ProfileSelectorComponent
        })

        return Promise.resolve(null);
    }
}