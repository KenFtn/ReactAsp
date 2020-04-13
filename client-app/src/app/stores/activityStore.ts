import {observable, action, computed, runInAction } from 'mobx';
import { SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';
import { RootStore } from './rootStore';
import { setActivityProps, createAttendee } from '../common/util/util';


export default class ActivityStore {

    rootStore: RootStore;
    constructor (rootStore : RootStore) {
        this.rootStore = rootStore;
    }


    // *******      Definition des observables ***********
    @observable activityRegistry = new Map(); // Permet de gérer les listes des activités. Voir la doc de MobX
    // On aurait pu également faire un array d'activité. Le fonctionnement serai le même, juste la syntax change.
    @observable activity: IActivity | null = null; //il n'y a pas d'activité selectionner de base
    @observable loadingInitial = false; // de base, il n'y as pas de loader
    @observable submitting = false; //observateur de l'envoie d'une nouvelle activité
    @observable target = '';
    @observable loading = false;

    // ******     Definition des computed *****************
    @computed get activitiesByDate() {
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values())); 
        // activityRegistry n'es pas un array donc je peux pas sort. Du coup je le convertie avant !!
    }

    // ****** Helper Fonction ***********
    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        )
        return Object.entries(sortedActivities.reduce((activities, activity) => {
          const date = activity.date.toISOString().split('T')[0];
          activities[date] = activities[date] ? [...activities[date], activity] : [activity];
          return activities;
        }, {} as {[key: string]: IActivity[]}));
      }

    // *******     Definition des actions *******

    //activitation du loader
    @action loadActivities = async () => {
        this.loadingInitial = true;
        try {
          const activities = await agent.Activities.list();
          runInAction('loading activities', () => {
            activities.forEach(activity => {
                setActivityProps(activity, this.rootStore.userStore.user!)
              this.activityRegistry.set(activity.id, activity);
            });
            this.loadingInitial = false;
          })
        } catch (error) {
          runInAction('load activities error', () => {
            this.loadingInitial = false;
          })
        }
      };

    //load d'une seul activité, pour faire fonctionner la route
    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if(activity) { //si mon activité est dans mon registry 
            this.activity = activity;
            this.activityRegistry.set(activity.id, activity);
            return activity;
        } else {
            this.loadingInitial = true; // j'active mon loader car je vais en base
            try {
                activity = await agent.Activities.details(id); //je requète ma base car j'ai pas l'activité dans mon registry
                runInAction('getting activity', () => {
                    setActivityProps(activity, this.rootStore.userStore.user!);
                    this.activity = activity;
                    this.loadingInitial = false;
                })
                return activity;
            } catch(error) {
                runInAction('get activity error', () => {
                    this.loadingInitial = false;
                })
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
            const attendee = createAttendee(this.rootStore.userStore.user!)
            attendee.isHost = true;
            let attendees = [];
            attendees.push(attendee);
            activity.attendees = attendees;
            activity.isHost = true;
            runInAction('creating activity',() => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            });
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            runInAction('create activity error',() => {
                this.submitting = false;
            });
            toast.error('Problem submitting data');
            console.log(error);
        }
    };

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity); // j'enregistre les modifs de mon activité en back.
            console.log(activity);
            runInAction('editing activities', () => {
                this.activityRegistry.set(activity.id, activity); // j'enregistre les modifs de mon activité en front. 
                this.activity = activity; // J'ouvre l'activité que je viens d'éditer
                this.submitting = false; // Je ferme l'envoie du formulaire
            });
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            runInAction('edit activities error',() => {
                this.submitting = false;
            });
            toast.error('Problem submitting data');
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

    @action attendActivity = async () => {
        const attendee = createAttendee(this.rootStore.userStore.user!);
        this.loading = true;
        try {   
            await agent.Activities.attend(this.activity!.id);
            runInAction(() => {
                if(this.activity){
                    this.activity.attendees.push(attendee);
                    this.activity.isGoing = true;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                } 
            })
        } catch ( error ){
            runInAction(() => {
                this.loading = false;
            })
            toast.error("Problem signing up to activity")
        }
    }

    @action cancelAttendance = async () => {
        this.loading = true;
        try {
            await agent.Activities.unattend(this.activity!.id)
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees = this.activity.attendees.filter(a => a.userName !== this.rootStore.userStore.user!.username);
                    this.activity.isGoing = false;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                };
            })
        } catch {
            runInAction(()=> {
                this.loading = false;
            })
            toast.error("Problem cancelling attendance")
        }


        
    }
}

