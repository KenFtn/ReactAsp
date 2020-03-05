import {observable, action} from 'mobx';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

class ActivityStore {
    // *******      Definition des observables ***********

    @observable activities: IActivity[] = [];
    @observable selectedActivity: IActivity | undefined; //il n'y a pas d'activité selectionner de base
    @observable loadingInitial = false; // de base, il n'y as pas de loader
    @observable editMode = false; //l'édit mode est faux par defaut


    // *******     Definition des actions *******

    @action loadActivities = () => {
       this.loadingInitial = true; // Je met le loader temps que mes activités ne sont pas chargé
       agent.Activities.list() //agent est mon fichier de config des appels API
       .then(activities => { 
           activities.forEach(activity => {
             activity.date = activity.date.split('.')[0]
             this.activities.push(activity);
           })
          }).finally(() => this.loadingInitial = false); // une fois finie, j'enléve mon loader
    }

    @action selectActivity = (id: string) => {
        this.selectedActivity = this.activities.find(a => a.id === id);
        this.editMode = false;
    }
}

export default createContext(new ActivityStore());