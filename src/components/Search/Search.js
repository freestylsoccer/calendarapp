import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';

import { withAuthorization, AuthUserContext } from '../Session';
import AsyncSelect from 'react-select/async';

class Search extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            selectedTag: [],
        };
    }
    static contextType = AuthUserContext;

    handleOnChange = (tags) => {
        this.setState({
            selectedTag: [tags]
        }, () => {
            this.props.getElementId(tags);
        })
    }
    
    componentDidMount = () => {
        const user = this.context;
        let coll = this.props.collection
        coll
            .orderBy('name')
            .limit(5)
            .where("companyId", "==", user.companyId)
            .where("status", "==", "Active")
            .get()
            .then((querySnapshot) => {
                let recommendedTags = []
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots                            
                    const tag = {
                        value: doc.id,
                        label: doc.data().name
                    }
                    recommendedTags.push(tag)
                });
                this.setState({ defaultOptions: recommendedTags });
            })
            .catch((error) => {                        
                console.log("Error getting documents: ", error);                
            });
    }

    loadOptions = async (inputValue) => {
        inputValue = inputValue.toLowerCase().replace(/\W/g, "");
        const user = this.context;
        if (inputValue.length >= 3) {
            return new Promise((resolve => {
                let coll = this.props.collection
                coll
                    .orderBy('name')
                    .startAt(inputValue)
                    .endAt(inputValue + "\uf8ff")
                    .limit(5)
                    .where("companyId", "==", user.companyId)
                    .where("status", "==", "Active")
                    .get()
                    .then((querySnapshot) => {
                        let recommendedTags = []
                        querySnapshot.forEach((doc) => {
                            // doc.data() is never undefined for query doc snapshots                            
                            const tag = {
                                value: doc.id,
                                label: doc.data().name
                            }
                            recommendedTags.push(tag)
                        });
                        return resolve(recommendedTags)
                    })
                    .catch((error) => {                        
                        console.log("Error getting documents: ", error);
                        return resolve([])
                    });                     
                })
            )
        }        
    }

    render(){
        
        return (            
            <AsyncSelect
                loadOptions={this.loadOptions}
                onChange={this.handleOnChange}
                defaultOptions={this.state.defaultOptions}
            />
        )
       }
}
const condition = authUser => authUser
 
export default compose(
  withAuthorization(condition),
  withFirebase,
)(Search);

