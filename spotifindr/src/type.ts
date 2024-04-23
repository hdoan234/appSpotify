export type ImageProps = {
    url: string
    height: number
    width: number
}

export interface UserDataProps {

    country: string,
    display_name: string,
    explicit_content : {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: {
        spotify: string
    },
    followers: {
        href: string,
        total: number
    },
    href: string;
    id: string;
    images: ImageProps[];
    product: string;
    type: string;
    uri: string;
}
export interface FollowUserProps {
    ok: boolean,
    userInfo: {
        email: string,
        name: string,
        spotifyId: string,
        imageUrl: string
    },
    playing: any | null
    devices: any
  }