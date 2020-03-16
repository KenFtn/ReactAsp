import React, { useContext, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import ActivityStore from '../../../app/stores/activityStore';
import LoadingComponent from '../../../app/layout/LoadingComponent';


const ActivityDashboard: React.FC = () => { //activities = props react
    const activityStore = useContext(ActivityStore);

    useEffect(() => {
      activityStore.loadActivities();
       }, [activityStore]); // tableau vide pour comparer les diff entre la 1er appel de fonction et la deuxiéme et permet de pas refaire la requète si besoin.
  
  
       if(activityStore.loadingInitial) return <LoadingComponent content='Loading activities ...' />

    return ( //look semantic react ui pour plus de détails 
        <Grid>
            <Grid.Column width={10}> 
                <ActivityList />
            </Grid.Column>
            <Grid.Column width={6}>
                <h2>Activity filters</h2>
            </Grid.Column>
        </Grid>
    )
}

export default observer(ActivityDashboard);