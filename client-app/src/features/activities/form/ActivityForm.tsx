import React, {useState, FormEvent, useContext, useEffect} from 'react';
import { Segment, Form, Button } from 'semantic-ui-react';
import { IActivity } from '../../../app/models/activity';
import {v4 as uuid} from 'uuid';
import ActivityStore from '../../../app/stores/activityStore';
import { observer } from 'mobx-react-lite';
import { RouteChildrenProps } from 'react-router-dom';

interface DetailParams {
    id:string;
}

const ActivityForm: React.FC<RouteChildrenProps<DetailParams>> = ({match, history}) => {
    const activityStore = useContext(ActivityStore);
    const {createActivity, editActivity, submitting, activity: initialFormState, loadActivity, clearActivity} = activityStore;


    const [activity, setActivity] = useState<IActivity>({
        id:'',
        title: '',
        category: '',
        description: '',
        date: '',
        city: '',
        venue: '', 
    });

    useEffect(() => {
        if(match?.params.id && activity.id.length === 0) {
            loadActivity(match.params.id).then(() => initialFormState && setActivity(initialFormState));
        }
        return () => {
            clearActivity()
        }
    }, [loadActivity, match?.params.id, clearActivity, initialFormState]);

    const handleSubmit = () => {
        if(activity.id.length === 0) {
            let newActivity = {
                ...activity, id: uuid()
            }
            createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));
        } else {
            editActivity(activity).then(() => history.push(`/activities/${activity.id}`));
        }
    }

    //Pour pouvoir modifier les values d'un form déjà préremplie, on dois modif le VDom pour update le vrai DOM.
    const handleInputChange = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = event.currentTarget
        setActivity({...activity, [name]: value})
    }

    return (
        <Segment clearing>
            <Form onSubmit={handleSubmit}>
                <Form.Input 
                    onChange={handleInputChange} 
                    name='title' 
                    placeholder='Title' 
                    value={activity.title}
                />
                <Form.TextArea
                    onChange={handleInputChange}
                    name='description' 
                    row={2} 
                    placeholder='Description' 
                    value={activity.description} 
                />
                <Form.Input 
                    onChange={handleInputChange}
                    name='category'
                    placeholder='Category' 
                    value={activity.category}
                />
                <Form.Input
                    onChange={handleInputChange}
                    name='date' 
                    type='datetime-local' 
                    placeholder='Date' 
                    value={activity.date} 
                />
                <Form.Input
                    onChange={handleInputChange} 
                    name='city'
                    placeholder='City' 
                    value={activity.city}
                />
                <Form.Input
                    onChange={handleInputChange} 
                    name='venue'
                    placeholder='Venue' 
                    value={activity.venue}
                />
                <Button
                    loading={submitting} 
                    floated="right" 
                    positive 
                    type='submit' 
                    content='submit'
                />
                <Button 
                    onClick={() => history.push('/activities')} 
                    floated="right" 
                    type='button' 
                    content='Cancel' 
                />
            </Form>
        </Segment>
    )
}

export default observer(ActivityForm); 