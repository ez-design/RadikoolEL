import {IProgram} from '../interfaces/program.interface';
import {IStation, IRegion} from '../interfaces/station.interface';

export interface IFavorite{
    station_id: string;
    program: IProgram;
}
