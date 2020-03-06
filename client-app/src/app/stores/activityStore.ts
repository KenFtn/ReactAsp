import {observable, action, computed} from 'mobx';
import { createContext } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

class ActivityStore {
    // *******      Definition des observables ***********
    @observable activityRegistry = new Map; // Permet de gérer les listes des activités. Voir la doc de MobX
    // On aurait pu également faire un array d'activité. Le fonctionnement serai le même, juste la syntax change.
    @observable activities: IActivity[] = [];
    @observable selectedActivity: IActivity | undefined; //il n'y a pas d'activité selectionner de base
    @observable loadingInitial = false; // de base, il n'y as pas de loader
    @observable editMode = false; //l'édit mode est faux par defaut
    @observable submitting = false; //observateur de l'envoie d'une nouvelle activité

    // ******     Definition des computed *****************
    @computed get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date)); 
        // activityRegistry n'es pas un array donc je peux pas sort. Du coup je le convertie avant
    }


    // *******     Definition des actions *******

    @action loadActivities = async () => {
       this.loadingInitial = true; // Je met le loader temps que mes activités ne sont pas chargé

       //remplacement des promesses axios par de l'asynchrone
       try {
            const activities = await agent.Activities.list(); // utilisation de axios via le ficher agent.ts
            activities.forEach(activity => {
                activity.date = activity.date.split('.')[0] // formatage de la date
                this.activityRegistry.set(activity.id, activity); // permet de 'mapper' l'activité. Prends deux params, une key et une value. voir doc MobX
            })
            this.loadingInitial = false; // j'enleve le loader
       } catch (error) {
            console.log(error);
            this.loadingInitial = false; // si erreur, j'enleve le loader quand même
       }
    };

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            this.activityRegistry.set(activity.id, activity);
            this.editMode = false; 
            this.submitting = false;
        } catch (error) {
            console.log(error);
            this.submitting = false;
        }
    };

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity); // j'enregistre les modifs de mon activité en back.
            this.activityRegistry.set(activity.id, activity); // j'enregistre les modifs de mon activité en front. 
            this.selectedActivity = activity; // J'ouvre l'activité que je viens d'éditer
            this.editMode = false; // Je ferme le formulaire
            this.submitting = false; // Je ferme l'envoie du formulaire
        } catch (error) {
            this.submitting = false;
            console.log(error);
        }
    }
    // ** action des forms **
    @action openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = undefined;
    }
    @action openEditFrom = (id: string) => { //id: string car je veux edit une activitée particuliére
        this.selectedActivity = this.activityRegistry.get(id); //je selecte mon activitée
        this.editMode = true; //j'ouve le formulaire
    }

    // ** action selection des activités
    @action selectActivity = (id: string) => {
        this.selectedActivity = this.activityRegistry.get(id); // Je prends l'activité via ma map d'activité
        this.editMode = false;
    };
}

export default createContext(new ActivityStore());