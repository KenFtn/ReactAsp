import React, { useState, useEffect, Fragment } from 'react';
import { Header, Icon, List, Container} from 'semantic-ui-react';
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

  const handleSelectActivity = (id: string) => {
    setSelectedActivity(activities.filter(a => a.id === id)[0]) //prendre l'index 0 car c'est un array. ( un array d'un seul élement )
  }

  useEffect(() => {
    axios.get<IActivity[]>('http://localhost:5000/api/activities')
      .then((response) => {
          setActivities(response.data)
         });
     }, []); // tableau vide pour comparer les diff entre la 1er appel de fonction et la deuxiéme et permet de pas refaire la requète si besoin.

    return (
      <Fragment>
          <NavBar />
          <Container style={{marginTop: "7em"}}>
            <ActivityDashboard 
              activities={activities} 
              selectActivity={handleSelectActivity} 
              selectedActivity={selectedActivity}
            />
          </Container>


      </Fragment>
    );
  

}

export default App;
