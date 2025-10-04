import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import FastHtmlBindDirective, { ProfilesService, ProfileProvider } from 'tabby-core'

import { ProfilesServicesOverride } from './services/profiles.service'
import { ProfileSelectorComponent } from './components/profileSelector.component'
import { ProfileSelectorProfilesService } from './profiles'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FormsModule
    ],
    providers: [
        { provide: ProfilesService, useClass: ProfilesServicesOverride },
        { provide: ProfileProvider, useClass: ProfileSelectorProfilesService, multi: true },
    ],
    declarations: [
        ProfileSelectorComponent,
        FastHtmlBindDirective
    ],
    exports: [
        FastHtmlBindDirective
    ]
})

export default class ProfileSeclectorPlugin { }