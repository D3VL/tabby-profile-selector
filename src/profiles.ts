import { Injectable } from '@angular/core'
import { ProfileProvider, NewTabParameters, Profile, PartialProfile } from 'tabby-core'
import { ProfileSelectorComponent } from './components/profileSelector.component'

@Injectable({ providedIn: 'root' })
export class ProfileSelectorProfilesService extends ProfileProvider<Profile> {
    id = 'profile-selector'
    name = 'Profile Selector'

    async getBuiltinProfiles(): Promise<PartialProfile<Profile>[]> {
        return [
            {
                id: 'profile-selector',
                type: 'profile-selector',
                name: 'Profile Selector',
                icon: 'fas fa-list',
                isBuiltin: true,
            },
        ]
    }

    async getNewTabParameters(_profile: Profile): Promise<NewTabParameters<ProfileSelectorComponent>> {
        return {
            type: ProfileSelectorComponent,
        }
    }

    getDescription(_profile: Profile): string {
        return 'Developed with ❤️ by D3VL'
    }
}