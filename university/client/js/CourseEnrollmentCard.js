import React from 'react';

import * as ResultService from './services/ResultService';
import * as EnrollmentService from './services/EnrollmentService';

import DataGrid from './components/DataGrid';
import StudentSearchBox from './StudentSearchBox';
import ResultFormWindow from './ResultFormWindow';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import json2csv from 'json2csv';
import {CSVLink, CSVDownload} from 'react-csv';

import {Icon} from './components/Icons';

export default React.createClass({

    getInitialState() {
        return {results:[]};
    },

    componentWillReceiveProps(props) {
        this.getResults(props.course);
    },

    getResults(courseId) {
        if (courseId) {
            ResultService.findByCourse(courseId).then(results => this.setState({results}));
        }
    },

    studentLinkHandler(result) {
        window.location.hash = "#student/" + this.props.course.university_id + result.student_id;
    },

    actionHandler(data, index, value, label) {
        switch(label) {
            case "View Student":
                this.studentLinkHandler(data);
                break;
            case "Delete":
                EnrollmentService.deleteItem(this.props.course.code+'_'+data.student_id)
                    .then(() => this.getResults(this.props.course));
                break;
            case "Submit":

                break;
        }
    },
    
    resultLinkHandler(result) {
        this.setState({estimatting:true, current: result.result, selected_hwId: result.homeworkId});
    },

    resultDeleteHandler(result) {
        ResultService.deleteFile(result.path)
        .then(() => this.getResults(this.props.course));
    },

    scoreSavedHandler() {
        this.setState({estimatting:false});
        this.getResults(this.props.course);
    },

    scoreCancelHandler() {
        this.setState({estimatting:false});
    },
    save_table()
    {
        let cols = [];
        
        // for(let index=0;index<keys.length;index++)
        // {
        //    cols.push(<div header={keys[index]} field={keys[index]}/>);
        // }
        // console.log(result.toString());
        for( let i = 0; i<1&&this.state.results.length; i++)
        {
            let keys = Object.keys(this.state.results[i]);
            let grades = this.state.results[i].grades.split(",");
            delete this.state.results[i].grades;
            for( x in grades)
            {
                let key_name = 'hw'+x;
                Object.assign(this.state.results[i], {key_name: grades[x]});
            }
            // for(let index = 0; index < keys.length; index ++)
            // {
            //     if(keys[index] == "name")
            //     {
            //         cols.push(<div header={keys[index]} field={keys[index]} sortable={true} onLink={this.studentLinkHandler}/>);    
            //     }
            //     else if(keys[index] == "id")
            //     {
            //         cols.push(<div header={keys[index]} field={keys[index]}/>);    
            //     }
            //     else if(keys[index] == "student_id")
            //     {
            //         continue;
            //     }
            //     else{
            //         if(keys[index].endsWith("_score"))
            //         {
            //             continue;
            //         }
            //         if(keys[index] == "grades")
            //         {
            //             let grades = keys[index].split(",");
            //             console.log(grades);
            //             for(x in grades)
            //             {
            //                 if(this.props.editable == true)
            //                     cols.push(<div header={keys[index]} field={keys[index+1]} action="Details" onLink={this.resultLinkHandler}/>);
            //                 else
            //                     cols.push(<div header={keys[index]} field={keys[index+1]}/>);
            //             }
            //         }
                    
            //     }
                
            // }
        }
        var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
      
        var ctx = {worksheet: name || 'Worksheet', cols}
        window.location.href = uri + base64(format(template, ctx))
     
    },
    render() {
        let cols = [];
        let data = [];
        
        // for(let index=0;index<keys.length;index++)
        // {
        //    cols.push(<div header={keys[index]} field={keys[index]}/>);
        // }
        for( let i = 0; i<this.state.results.length; i++)
        {
            let grades = this.state.results[i]["grades"].replace(/\s/g,'').split(",");
            delete this.state.results[i]["grades"];
            for(let x = 1; x <= grades.length; x++)
            {
                let key_name = 'hw'+x;
                if(this.props.editable == true)
                    this.state.results[i][key_name] = grades[x-1]=="-"?" ":grades[x-1];
                else
                this.state.results[i][key_name] = grades[x-1];
            }
        }
        for( let i = 0; i<1&&this.state.results.length; i++)
        {
            let keys = Object.keys(this.state.results[i]);
            for(let index = 0; index < keys.length; index ++)
            {
                if(keys[index] == "name")
                {
                    cols.push(<div header={keys[index]} field={keys[index]}/>);    
                }
                else if(keys[index] == "id")
                {
                    cols.push(<div header={keys[index]} field={keys[index]}/>);    
                }
                else if(keys[index] == "student_id")
                {
                    continue;
                }
                else{
                    if(keys[index].endsWith("code"))
                    {
                        continue;
                    }
                    if(this.props.editable == true)
                        cols.push(<div header={keys[index]} field={keys[index]} action={keys[index]!=""?"Details":""} onLink={this.resultLinkHandler}/>);
                    else
                        cols.push(<div header={keys[index]} field={keys[index]}/>);
                }
                
            }
        }
        
        
        // <div header={item} field={item}/>

        
        return (
            <div className="slds-card">
                <header className="slds-card__header slds-grid">
                    <div className="slds-media slds-media--center slds-has-flexi-truncate">
                        <div className="slds-media__figure">
                            <Icon name={this.props.icon} size="small"/>
                        </div>
                        <div className="slds-media__body">
                            <h3 className="slds-text-heading--small slds-truncate">{this.props.title}</h3>
                        </div>
                        {
                            !this.props.editable&&sessionStorage.pos=="teacher"?
                        <ReactHTMLTableToExcel
                            id="test-table-xls-button"
                            className="slds-button slds-button--neutral"
                            table="table-to-xls"
                            filename="tablexls"
                            sheet="tablexls"
                            buttonText="Download as XLS"/>:null
                        }
                    </div>
                </header>

                <section className="slds-card__body">
                    <DataGrid table_id={this.props.editable?"":"table-to-xls"} data={this.state.results} actions={sessionStorage.pos=="teacher"&&this.props.editable?["Delete"]:null} onAction={this.actionHandler}>
                        {/* <div header="Name" field="name" sortable={true} onLink={this.studentLinkHandler}/>
                        <div header="Student ID" field="student_id"/> */}
                        {cols}
                    </DataGrid>
                </section>

                {this.state.estimatting?<ResultFormWindow result={this.state.current} course={this.props.course} selected_hw={this.state.selected_hwId} onSaved={this.scoreSavedHandler} onCancel={this.scoreCancelHandler}/>:null}
            </div>

        );
    }

});