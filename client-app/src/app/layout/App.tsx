import React, {useEffect, Fragment, useContext } from 'react';
import { Container} from 'semantic-ui-react';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import LoadingComponent from './LoadingComponent';
import ActivityStore from '../stores/activityStore';
import {observer} from 'mobx-react-lite';


//Utilisation des Reacts Hooks => 
const App = () =>  {
  const activityStore = useContext(ActivityStore);

  useEffect(() => {
    activityStore.loadActivities();
     }, [activityStore]); // tableau vide pour comparer les diff entre la 1er appel de fonction et la deuxiéme et permet de pas refaire la requète si besoin.


     if(activityStore.loadingInitial) return <LoadingComponent content='Loading activities ...' />

    return (
      <Fragment>
          <NavBar />
          <Container style={{marginTop: "7em"}}>
            <ActivityDashboard />
          </Container>


      </Fragment>
    );
  

}

export default observer(App);
