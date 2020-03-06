import React, { useState, useEffect, Fragment, SyntheticEvent, useContext } from 'react';
import { Container} from 'semantic-ui-react';
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import {observer} from 'mobx-react-lite';

interface IState {
  activities : IActivity[]
}

//Utilisation des Reacts Hooks => 
const App = () =>  {
  const activityStore = useContext(ActivityStore);

  const [activities, setActivities] = useState<IActivity[]>([]) // On utilse useState de React Hooks en plus précisant le type via notre interface.
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null); //Ici, on def l'activité selectionné, elle peut-être nul ou pas. Elle est donc de type null ou de type 'Activity'
  
  const [editMode, setEditMode] = useState(false);

  //def des conditions de loading
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState('');

  
  const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    setSubmitting(true);
    setTarget(event.currentTarget.name) 
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(a => a.id !== id)])
    }).then(() => setSubmitting(false))
    
  }


  useEffect(() => {
    activityStore.loadActivities();
     }, [activityStore]); // tableau vide pour comparer les diff entre la 1er appel de fonction et la deuxiéme et permet de pas refaire la requète si besoin.


     if(activityStore.loadingInitial) return <LoadingComponent content='Loading activities ...' />

    return (
      <Fragment>
          <NavBar />
          <Container style={{marginTop: "7em"}}>
            <ActivityDashboard 
              activities={activityStore.activities}  
              setEditMode={setEditMode}
              setSelectedActivity={setSelectedActivity}
              deleteActivity={handleDeleteActivity}
              submitting={submitting}
              target={target}
            />
          </Container>


      </Fragment>
    );
  

}

export default observer(App);
