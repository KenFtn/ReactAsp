import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';
import { Container} from 'semantic-ui-react';
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';

interface IState {
  activities : IActivity[]
}

//Utilisation des Reacts Hooks => 
const App = () =>  {
  const [activities, setActivities] = useState<IActivity[]>([]) // On utilse useState de React Hooks en plus précisant le type via notre interface.
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null); //Ici, on def l'activité selectionné, elle peut-être nul ou pas. Elle est donc de type null ou de type 'Activity'
  
  const [editMode, setEditMode] = useState(false);

  //def des conditions de loading
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState('');

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter(a => a.id === id)[0]) //prendre l'index 0 car c'est un array. ( un array d'un seul élement )
    setEditMode(false);
  }
  //fonction pour ouvrir le formulaire et fermer le détail lorsque j'appuis sur "create new activity"
  const handleOpenCreateForm = () => {
    setSelectedActivity(null);
    setEditMode(true);
  }

  const handleCreateActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.create(activity).then(() => {
      setActivities([...activities, activity])
      setSelectedActivity(activity);
      setEditMode(false);
    }).then(() => setSubmitting(false))
  }

  const handleEditActivity = (activity: IActivity) => {
    setSubmitting(true);
    agent.Activities.update(activity).then(() => {
      setActivities([...activities.filter(a => a.id !== activity.id), activity])
      setSelectedActivity(activity);
      setEditMode(false);
    }).then(() => setSubmitting(false))

  }

  const handleDeleteActivity = (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    setSubmitting(true);
    setTarget(event.currentTarget.name) 
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(a => a.id !== id)])
    }).then(() => setSubmitting(false))
    
  }


  useEffect(() => {
    agent.Activities.list()
      .then((response) => {
          let activities: IActivity[] = [];
          response.forEach(activity => {
            activity.date = activity.date.split('.')[0]
            activities.push(activity);
          })
          setActivities(activities);
         }).then(() => setLoading(false));
     }, []); // tableau vide pour comparer les diff entre la 1er appel de fonction et la deuxiéme et permet de pas refaire la requète si besoin.


     if(loading) return <LoadingComponent content='Loading activities ...' />

    return (
      <Fragment>
          <NavBar openCreateForm={handleOpenCreateForm}/>
          <Container style={{marginTop: "7em"}}>
            <ActivityDashboard 
              activities={activities} 
              selectActivity={handleSelectActivity} 
              selectedActivity={selectedActivity}
              editMode={editMode}
              setEditMode={setEditMode}
              setSelectedActivity={setSelectedActivity}
              createActivity={handleCreateActivity}
              editActivity={handleEditActivity}
              deleteActivity={handleDeleteActivity}
              submitting={submitting}
              target={target}
            />
          </Container>


      </Fragment>
    );
  

}

export default App;
