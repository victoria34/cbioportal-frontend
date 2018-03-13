import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import $ from 'jquery';
import {observer} from "mobx-react";
import {remoteData} from "../../shared/api/remoteData";
import {action, computed, observable, reaction} from "mobx";
import client from "shared/api/cbioportalInternalClientInstance";
import {keepAlive} from "mobx-utils";


function getMutatedGenes(query:string){
    console.log("fetching genes");
    return new Promise((resolve,reject)=>{
        setTimeout(function(){
            resolve(_.filter(["aaron","nora","natasha", "john"],(name:string)=>name.includes(query)))
        },1000);
    });

}


// this is an example of using client.
client.getAllGenesetsUsingGET({}).then(function(data){
    console.log(data);
});

class StudyViewPageStore {

    constructor(){
        //keepAlive(this.testMobxPromise, "result");
    }

    @observable filterTerm = "";


    // readonly mutatedGenes = remoteData({
    //
    //     await:()=>[
    //
    //     ],
    //
    //     invoke:()=>{
    //
    //         return getMutatedGenes(this.filterTerm);
    //
    //     }
    //
    // });

    readonly testMobxPromise = remoteData({
        invoke: ()=>{
            // guaranteed no invoke dirtiness
            console.log("TEST");
            return Promise.resolve(4);

        }
    });


}


// making this an observer (mobx-react) causes this component to re-render any time
// there is a change to any observable value which is referenced in its render method. 
// Even if this value is referenced deep within some helper method
@observer
export default class StudyViewPage extends React.Component<{}, {}> {

    store:StudyViewPageStore;
    queryInput:HTMLInputElement;

    constructor(){
        super();

        this.store = new StudyViewPageStore();

        setInterval(()=>console.log(this.store.testMobxPromise.result), 1000);
        //setTimeout(()=>console.log(this.store.testMobxPromise.result), 3000);

    }

    @observable tooltipState = true;

    @action handleQueryChange(){

        this.store.filterTerm=this.queryInput.value;

    }

    render(){

        //var moo = (this.store.testMobxPromise.isPending);

        return (

            <div>
                <input type="text"
                       value={this.store.filterTerm}
                       ref={(el:HTMLInputElement)=>this.queryInput = el}
                       onInput={ (el:HTMLInputElement)=>this.handleQueryChange() }
                />
                <div>


                </div>
            </div>
        )

    }
}
