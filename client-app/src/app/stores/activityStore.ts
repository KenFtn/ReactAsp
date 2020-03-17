import {observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';


configure({enforceActions: 'always'}); //scrict mode for mobX

class ActivityStore {
    // *******      Definition des observables ***********
    @observable activityRegistry = new Map(); // Permet de gérer les listes des activités. Voir la doc de MobX
    // On aurait pu également faire un array d'activité. Le fonctionnement serai le même, juste la syntax change.
    @observable activity: IActivity | null = null; //il n'y a pas d'activité selectionner de base
    @observable loadingInitial = false; // de base, il n'y as pas de loader
    @observable submitting = false; //observateur de l'envoie d'une nouvelle activité
    @observable target = '';

    // ******     Definition des computed *****************
    @computed get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values())); 
        // activityRegistry n'es pas un array donc je peux pas sort. Du coup je le convertie avant !!
    }

    // ****** Helper Fonction ***********
    groupActivitiesByDate(activities: IActivity[]){
        const sortedActivities = activities.sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date)
        )
        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const date = activity.date.split('T')[0];
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            return activities;
        }, {} as { [key:string] : IActivity[] }));
    }

    // *******     Definition des actions *******

    //activitation du loader
    @action loadActivities = async () => {
       this.loadingInitial = true; // Je met le loader temps que mes activités ne sont pas chargé

       //remplacement des promesses axios par de l'asynchrone
       try {
            const activities = await agent.Activities.list(); // utilisation de axios via le ficher agent.ts
            runInAction('loading activities', () => { // activation de mobX strict mode. Impossible de changer le state pendant une action normalement. Donc RunInAction permet de changer ça. 
                activities.forEach(activity => {
                    activity.date = activity.date.split('.')[0] // formatage de la date
                    this.activityRegistry.set(activity.id, activity); // permet de 'mapper' l'activité. Prends deux params, une key et une value. voir doc MobX
                })
                this.loadingInitial = false; // j'enleve le loader
            })
       } catch (error) {
           runInAction('load activities error',() => {
                this.loadingInitial = false; // si erreur, j'enleve le loader quand même
           })
            console.log(error);
       }
    };

    //load d'une seul activité, pour faire fonctionner la route
    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if(activity) { //si mon activité est dans mon registry 
            this.activity = activity;
        } else {
            this.loadingInitial = true; // j'active mon loader car je vais en base
            try {
                activity = await agent.Activities.details(id); //je requète ma base car j'ai pas l'activité dans mon registry
                runInAction('getting activity', () => {
                    this.activity = activity;
                    this.loadingInitial = false;
                })
            } catch(error) {
                runInAction('get activity error', () => {
                    this.loadingInitial = false;
                })
                console.log(error)
            }
        }
    }

    @action clearActivity = () => {
        this.activity = null;
    }

    //fonction pour prendre une activité de la base de donnée. Couvre le scénario des bookmark et des refresh ( mon registry d'activité est vide dans ces cas là)
    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            runInAction('creating activity',() => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            })
        } catch (error) {
            runInAction('create activity error',() => {
                this.submitting = false;
            })
            console.log(error);
        }
    };

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity); // j'enregistre les modifs de mon activité en back.
            runInAction('editing activities', () => {
                this.activityRegistry.set(activity.id, activity); // j'enregistre les modifs de mon activité en front. 
                this.activity = activity; // J'ouvre l'activité que je viens d'éditer
                this.submitting = false; // Je ferme l'envoie du formulaire
            })

        } catch (error) {
            runInAction('edit activities error',() => {
                this.submitting = false;
            })
            console.log(error);
        }
    }

    // ** action des forms **

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction('deleting activities' ,() => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            })

        } catch (error){
            runInAction('delete activities error',() => {
                this.submitting = false;
                this.target = '';
            })
            console.log(error);
        }
        
    }

}

export default createContext(new ActivityStore());