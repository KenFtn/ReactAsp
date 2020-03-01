import React, { useState, useEffect, Fragment } from 'react';
import { Container} from 'semantic-ui-react';
import axios from 'axios';
import { IActivity } from '../models/activity';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';

interface IState {
  activities : IActivity[]
}

//Utilisation des Reacts Hooks => 
const App = () =>  {
  const [activities, setActivities] = useState<IActivity[]>([]) // On utilse useState de React Hooks en plus précisant le type via notre interface.
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(null); //Ici, on def l'activité selectionné, elle peut-être nul ou pas. Elle est donc de type null ou de type 'Activity'
  
  const [editMode, setEditMode] = useState(false);

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
    setActivities([...activities, activity])
    setSelectedActivity(activity);
    setEditMode(false);
  }

  const handleEditActivity = (activity: IActivity) => {
    setActivities([...activities.filter(a => a.id !== activity.id), activity])
    setSelectedActivity(activity);
    setEditMode(false);
  }

  const handleDeleteActivity = (id: string) => {
    setActivities([...activities.filter(a => a.id !== id)])
  }


  useEffect(() => {
    axios.get<IActivity[]>('http://localhost:5000/api/activities')
      .then((response) => {
          let activities: IActivity[] = [];
          response.data.forEach(activity => {
            activity.date = activity.date.split('.')[0]
            activities.push(activity);
          })
          setActivities(activities);
         });
     }, []); // tableau vide pour comparer les diff entre la 1er appel de fonction et la deuxiéme et permet de pas refaire la requète si besoin.

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
            />
          </Container>


      </Fragment>
    );
  

}

export default App;
