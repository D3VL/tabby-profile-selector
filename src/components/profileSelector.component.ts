import { Component, Injector, OnInit, Input } from '@angular/core'
import { BaseTabComponent, ConfigService, ProfilesService, PartialProfile, Profile } from 'tabby-core'
import FuzzySearch from 'fuzzy-search'

// type nestedGroup = {
//     name: string | null,
//     profiles: PartialProfile<Profile>[] | null,
//     subgroups: { [subgroup: string]: nestedGroup }
// }

/** @hidden */
@Component({
    selector: 'profile-selector',
    template: require('./profileSelector.component.html'),
    styles: [`
        .selector-card {
            width: 300px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            color: inherit;
        }
        .selector-card:hover {
            filter: brightness(1.2);
            background-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .selector-card_icon {
            font-size: 20px;
            width: 40px;
            height: 100%;
            padding: .6rem;
        }

        .selector-card_title {
            text-overflow: ellipsis;
            max-width: 230px;
            overflow: hidden;
            white-space: nowrap;

        }
    `]
})
export class ProfileSelectorComponent extends BaseTabComponent implements OnInit {
    profiles: PartialProfile<Profile>[] = [];
    @Input() search: string = '';
    groups: string[] = [];
    groupedProfiles: { [group: string]: PartialProfile<Profile>[] } = {};

    constructor(
        public config: ConfigService,
        public profilesService: ProfilesService,
        injector: Injector,
    ) {
        super(injector)
        this.icon = 'fas fa-grip'
        this.title = 'Select Profile'
    }

    #groupOrder(g: string): string {
        if (g === 'Recent') return '0000'
        if (g === 'Favorites' || g === 'Starred' || g === 'Favourites' || g === 'Favorite' || g === 'Favourited') return '0001'
        if (g === 'Ungrouped') return 'ZZZX'
        if (g.startsWith('Imported ')) return 'ZZZY'
        if (g === 'Built-in') return 'ZZZZ'
        return g
    }

    #parseColor(color: string): { r: number, g: number, b: number } | null {
        if (color.startsWith('#')) return {
            r: parseInt(color.slice(1, 3), 16),
            g: parseInt(color.slice(3, 5), 16),
            b: parseInt(color.slice(5, 7), 16)
        }

        if (color.startsWith('rgb')) {
            const parts = color.replace(/rgba?\(/, '').replace(')', '').split(',').map(p => p.trim())
            if (parts.length >= 3) return {
                r: parseInt(parts[0], 10),
                g: parseInt(parts[1], 10),
                b: parseInt(parts[2], 10)
            }
        }

        return null
    }

    #getIconHtml(profile: PartialProfile<Profile>): string {
        if (!profile.icon) return `<i class="fa fa-user text-white"></i>`
        if (profile.icon.startsWith('<')) return profile.icon
        if (profile.icon.startsWith('data:') || profile.icon.startsWith('http')) return `<img src="${profile.icon}" class="h-100" />`
        return `<i class="fa ${profile.icon} text-white"></i>`
    }

    #tintProfileColor(profile: PartialProfile<Profile>, tint: number = 1.0, important: boolean = false, defaultColor: string = 'inherit'): string {
        // tint the color for light/dark variants
        if (profile.color) {
            const rgb = this.#parseColor(profile.color)
            if (rgb) {
                let { r, g, b } = rgb
                if (tint < 1.0) {
                    r = Math.round(r * tint + 255 * (1 - tint))
                    g = Math.round(g * tint + 255 * (1 - tint))
                    b = Math.round(b * tint + 255 * (1 - tint))
                } else if (tint > 1.0) {
                    const itint = tint - 1.0
                    r = Math.round(r * (1 - itint))
                    g = Math.round(g * (1 - itint))
                    b = Math.round(b * (1 - itint))
                }
                return `rgb(${r}, ${g}, ${b})${important ? ' !important' : ''}`
            }

            // assume valid css color string
            return profile.color + (important ? ' !important' : '')
        }

        // default color
        return `${defaultColor} ${important ? '!important' : ''}`
    }

    #doGroupProfiles(profiles: PartialProfile<Profile>[] = this.profiles) {
        console.log('doGroupProfiles', profiles)
        if (profiles.length === 0) {
            this.groups = []
            this.groupedProfiles = {}
            return;
        }

        this.groups = Array.from(new Set(profiles.map(p => p.group).filter(g => !!g))).sort((a, b) => this.#groupOrder(a!).localeCompare(this.#groupOrder(b!))) as string[];

        // create groupedProfiles
        this.groupedProfiles = {}
        for (const group of this.groups) {
            this.groupedProfiles[group] = profiles.filter(p => p.group === group)
        }
    }

    async #initProfiles() {
        const profiles = await this.profilesService.getProfiles()
        const recentProfiles = this.profilesService.getRecentProfiles().map(x => ({ ...x, group: 'Recent' }))

        // clean up profiles list
        for (const _profile of [...profiles, ...recentProfiles]) {

            // get selectorOptionForProfile to ensure it's valid
            const option = this.profilesService.selectorOptionForProfile(_profile)

            const profile = {
                ...option,
                ..._profile,
            } as PartialProfile<Profile> & {
                borderColor?: string
                iconHtml?: string
            }

            profile.borderColor = this.#tintProfileColor(profile, 1.1, true, 'var(--theme-secondary-less-2)')
            profile.iconHtml = this.#getIconHtml(profile)


            // ensure all profiles have a name
            if (!profile.name) {
                profile.name = this.profilesService.getDescription(profile) || 'Unnamed'
            }

            // add non-grouped builtin profiles to 'Built-in' group
            if (!profile.group && profile.isBuiltin) {
                profile.group = 'Built-in'
            }

            // convert group uuids to names, if no group, set to 'Ungrouped'
            if (profile.group) {
                profile.group = this.config.store.groups.find(g => g.id === profile.group)?.name ?? profile.group
            } else {
                profile.group = 'Ungrouped'
            }

            this.profiles.push({ ...profile })
        }

        // remove built-in profiles if the setting is off
        if (!this.config.store.terminal.showBuiltinProfiles) {
            this.profiles = this.profiles.filter(x => !x.isBuiltin)
        }

        // remove template profiles
        this.profiles = this.profiles.filter(x => !x.isTemplate)

        // remove blacklisted profiles
        this.profiles = this.profiles.filter(x => x.id && !this.config.store.profileBlacklist.includes(x.id))

        // sort profiles by group (with special groups first) and name
        this.profiles.sort((a, b) => {
            if (a.group === b.group) {
                return a.name.localeCompare(b.name)
            }
            return this.#groupOrder(a.group!).localeCompare(this.#groupOrder(b.group!))
        })
    }

    selectProfile(profile: PartialProfile<Profile>) {
        this.profilesService.launchProfile(profile)
        this.destroy()
    }

    onSearchChange(): void {
        try {
            console.log('onSearchChange', this.search, this.profiles)
            const q = this.search.trim().toLowerCase()

            if (q.length === 0) {
                this.#doGroupProfiles(this.profiles)
                return
            }

            const matches = new FuzzySearch(
                this.profiles.filter(p => p.group !== 'Recent'),
                ['name', 'group', 'description'],
                { sort: false },
            ).search(q);

            this.#doGroupProfiles(matches);
        } catch (error) {
            console.error('Error occurred during search:', error);
        }
    }

    async ngOnInit() {
        await this.#initProfiles()
        this.#doGroupProfiles(this.profiles)
    }
}