export interface IRegion{
    regionId: string;
    regionName:string;
    stations:IStation[];
}

export interface IStation{
    asciiName: string;
    href: string;
    id: string;
    logo: string;
    name: string;
}