import React from 'react';
import { Grid, List } from 'semantic-ui-react';
import { IActivity } from '../../../app/models/activity';
import ActivityList from './ActivityList';
import ActivityDetails from '../details/ActivityDetails';
import ActivityForm from '../form/ActivityForm';

interface IProps {
    activities : IActivity[] // création d'une interface pour descendre les variables depuis app
    selectActivity: (id: string) => void;
    selectedActivity: IActivity | null;
}

const ActivityDashboard: React.FC<IProps> = ({activities, selectActivity, selectedActivity}) => { //activities = props react
    return ( //look semantic react ui pour plus de détails 
        <Grid>
            <Grid.Column width={10}> 
                <ActivityList activities = {activities} selectActivity={selectActivity}/>
            </Grid.Column>
            <Grid.Column width={6}>
                {selectedActivity && <ActivityDetails activity={selectedActivity} />}
                <ActivityForm />
            </Grid.Column>
        </Grid>
    )
}

export default ActivityDashboard;