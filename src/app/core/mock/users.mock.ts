import { COMPETITIONS, USER_ROLES } from '../models/auth.model';

export const MOCK_USERS = [
  {
    _id: '1',
    dealernumber: '1987',
    email: 'info@falkduwe.de',
    password: 'pass123',
    role: USER_ROLES.SYSADMIN,
    firstname: 'Falk',
    surname: 'Duwe',
    competition: null
  },
  {
    _id: '2',
    dealernumber: 'vipp',
    email: 'susanne@vippevents.de',
    password: 'vipp123',
    role: USER_ROLES.VIPP_ADMIN,
    firstname: 'Susanne',
    surname: 'Bautz',
    competition: null
  },
  {
    _id: '3',
    dealernumber: 'cnh1',
    email: 'admin@cnh.de',
    password: 'cnh1',
    role: USER_ROLES.CNH_ADMIN,
    firstname: 'Tom',
    surname: 'Saywer',
    competition: null
  },
  {
    _id: '4',
    dealernumber: 'cnh2',
    email: 'sales@cnh.de',
    password: 'cnh2',
    role: USER_ROLES.CNH_SALES,
    firstname: 'Lena',
    surname: 'Meyer',
    competition: COMPETITIONS.CASE_STEYR
  },
  {
    _id: '5',
    dealernumber: 'cnh3',
    email: 'management@cnh.de',
    password: 'cnh3',
    role: USER_ROLES.CNH_MANAGEMENT,
    firstname: 'Tim',
    surname: 'Koch',
    competition: COMPETITIONS.CASE_STEYR
  },
  {
    _id: '6',
    dealernumber: 'cnh4',
    email: 'sales@cnh.de',
    password: 'cnh4',
    role: USER_ROLES.CNH_SALES,
    firstname: 'Max',
    surname: 'Müller',
    competition: COMPETITIONS.NEW_HOLLAND
  },
  {
    _id: '7',
    dealernumber: 'cnh5',
    email: 'management@cnh.de',
    password: 'cnh5',
    role: USER_ROLES.CNH_MANAGEMENT,
    firstname: 'Laura',
    surname: 'Schuster',
    competition: COMPETITIONS.NEW_HOLLAND
  }
];