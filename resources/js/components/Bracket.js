import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Matchup from './Matchup';
import Connector from './Connector';
import axios from 'axios';
import update from 'immutability-helper';

export default class Bracket extends Component {
    constructor(){
        super()
        this.state = {
            brackets: [],
            bracket_actual: "",
            competition: "",
            info: "",
            equipos: [[[],[],[],[]],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
            partidos: [
                [['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','','']],
                [['','',''],['','',''],['','',''],['','','']],
                [['','',''],['','','']],
                [['','','']]
            ],
            logos: [],
            cuartos : ["","","","","","","",""],
            semis : ["","","",""],
            final : ["",""],
            champ : "",
            a: [],
            b: [],
            c: []
        }
        this.handleEighthWinner = this.handleEighthWinner.bind(this)
        this.handleQuarterWinner = this.handleQuarterWinner.bind(this)
        this.handleSemiWinner = this.handleSemiWinner.bind(this)
        this.handleFinalWinner = this.handleFinalWinner.bind(this)
        this.changeBracket = this.changeBracket.bind(this)
        this.saveMatches = this.saveMatches.bind(this)
        this.deleteMatches = this.deleteMatches.bind(this)
    }

    componentDidMount(){
        window.axios = require('axios');
        let api_token = document.querySelector('meta[name="api-token"]');
        let token = document.head.querySelector('meta[name="csrf-token"]');
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + api_token.content;
    }

    componentWillMount() {
        axios.get('/api/brackets').then(response => {
            this.setState({brackets: response.data})
            this.changeBracket(this.state.brackets[0].id)
        })
        
        for(let i=0; i<4;i++){
            this.state.a.push(1)
            if(i<2){
                this.state.b.push(1)
            }
        }
    }

    saveMatches(){
        const data = this.state
        axios.post('/api/bracket/store', {
                data
        })
    }

    deleteMatches(){
        const route='/api/bracket/delete/'.concat(this.state.bracket_actual)
        axios.delete(route, {id: this.state.bracket_actual}).then(this.changeBracket(this.state.bracket_actual))
        this.setState({
            partidos: [
                [['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','','']],
                [['','',''],['','',''],['','',''],['','','']],
                [['','',''],['','','']],
                [['','','']]],
            cuartos : ["","","","","","","",""],
            semis : ["","","",""],
            final : ["",""],
            champ : ""
        })
    }

    changeBracket(id){
        const route = '/api/bracket/'.concat(id)
        const teams ='/api/teams/'.concat(id)
        axios.get(teams).then(response => {
            response.data.forEach(team => {
                this.setState({equipos: update(this.state.equipos,{[Math.floor(team.id/10)%16]: {$set: [team.name, team.description, team.icon, team.id, team.bracket_id]}})})
            });
        })
        axios.get(route).then(response2 => {
            this.setState({
                champ: response2.data[1]!=null ? this.state.equipos[Math.floor(response2.data[1].team_id/10)%16] : "",
                competition: this.state.brackets[Math.floor(id/10)].competition_name,
                bracket_actual: Math.floor(id/10),
                info: this.state.brackets[Math.floor(id/10)].description,
                partidos: [
                    [['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','',''],['','','']],
                    [['','',''],['','',''],['','',''],['','','']],
                    [['','',''],['','','']],
                    [['','','']]
                ],
                cuartos : ["","","","","","","",""],
                semis : ["","","",""],
                final : ["",""]
            })
            response2.data[0].forEach(match => {
                switch(match.phase) {
                    case 'quarter':
                        this.setState({partidos: update(this.state.partidos,{1: {[match.match_no] : {[0] : {$set: match.team1}}}})})
                        this.setState({cuartos: update(this.state.cuartos,{[match.match_no*2] : {$set: this.state.equipos[Math.floor(match.team1/10)%16]}})})
                        this.setState({partidos: update(this.state.partidos,{1: {[match.match_no] : {[1] : {$set: match.team2}}}})})
                        this.setState({cuartos: update(this.state.cuartos,{[match.match_no*2+1] : {$set: this.state.equipos[Math.floor(match.team2/10)%16]}})})
                        this.setState({partidos: update(this.state.partidos,{1: {[match.match_no] : {[2] : {$set: match.result}}}})})
                        break
                    case 'semis':
                        this.setState({partidos: update(this.state.partidos,{2: {[match.match_no] : {[0] : {$set: match.team1}}}})})
                        this.setState({semis: update(this.state.semis,{[match.match_no*2] : {$set: this.state.equipos[Math.floor(match.team1/10)%16]}})})
                        this.setState({partidos: update(this.state.partidos,{2: {[match.match_no] : {[1] : {$set: match.team2}}}})})
                        this.setState({semis: update(this.state.semis,{[match.match_no*2+1] : {$set: this.state.equipos[Math.floor(match.team2/10)%16]}})})
                        this.setState({partidos: update(this.state.partidos,{2: {[match.match_no] : {[2] : {$set: match.result}}}})})
                        break
                    case 'final':
                        this.setState({partidos: update(this.state.partidos,{3: {0 : {[0] : {$set: match.team1}}}})})
                        this.setState({final: update(this.state.final,{0 : {$set: this.state.equipos[Math.floor(match.team1/10)%16]}})})
                        this.setState({partidos: update(this.state.partidos,{3: {0 : {[1] : {$set: match.team2}}}})})
                        this.setState({final: update(this.state.final,{1 : {$set: this.state.equipos[Math.floor(match.team2/10)%16]}})})
                        this.setState({partidos: update(this.state.partidos,{3: {0 : {[2] : {$set: match.result}}}})})
                        break
                    }
            });
        });
    }

    handleEighthWinner(id, winner){
        const anterior=this.state.cuartos[id-1]
        this.setState({
            cuartos: update(this.state.cuartos,{[id-1]: {$set: winner}}),
            partidos: update(this.state.partidos,{0: {[id-1]: {2: {$set: winner}}}, 1: {[Math.floor((id-1)/2)]: {[(id-1)%2]: {$set: winner}}}})
        })
        if (this.state.semis[Math.floor((id-1)/2)]!="" && this.state.semis[Math.floor((id-1)/2)]==anterior){
            this.setState({
                semis: update(this.state.semis,{[Math.floor((id-1)/2)]: {$set: winner}})
            })
            if (this.state.final[Math.floor((id-1)/4)]!="" && this.state.final[Math.floor((id-1)/4)]==anterior){
                this.setState({
                    final: update(this.state.final,{[Math.floor((id-1)/4)]: {$set: winner}})
                })
                if (this.state.champ!="" && this.state.champ==anterior)
                    this.setState({
                        champ: winner
                    })
            }
        }
    }

    handleQuarterWinner(id, winner){
        const anterior=this.state.semis[id-9]
        this.setState({
            semis: update(this.state.semis,{[id-9]: {$set: winner}}),
            partidos: update(this.state.partidos,{1: {[id-9]: {2: {$set: winner}}}, 2: {[Math.floor((id-9)/2)]: {[(id-9)%2]: {$set: winner}}}})
        })
        if (this.state.final[Math.floor((id-9)/2)]!="" && this.state.final[Math.floor((id-9)/2)]==anterior){
            this.setState({
                final: update(this.state.final,{[Math.floor((id-9)/2)]: {$set: winner}})
            })
            if (this.state.champ!="" && this.state.champ==anterior)
                this.setState({
                    champ: winner
                })
        }
    }

    handleSemiWinner(id, winner){
        const anterior=this.state.final[id-13]
        this.setState({
            final: update(this.state.final,{[id-13]: {$set: winner}}),
            partidos: update(this.state.partidos,{2: {[id-13]: {2: {$set: winner}}}, 3: {[Math.floor((id-13)/2)]: {[(id-13)%2]: {$set: winner}}}})
        })
        if (this.state.champ!="" && this.state.champ==anterior)
            this.setState({
                champ: winner
            })
    }

    handleFinalWinner(id, champion){
        this.setState({
            champ: champion,
            partidos: update(this.state.partidos,{3: {[id-15]: {2: {$set: champion}}}})
        })
    }

    render() {
        return (
            <>
            <h1 className="mt-3 mb-3">Competencias</h1>
            <div className='row justify-content-center'> 
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Copas
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">{ this.state.brackets.map((id,id2) => ( <a className="dropdown-item" key = {id2+1} onClick={(event) => this.changeBracket(id2+10)}> Copa {id2+1}</a> ))}</div>
                <div/>
            </div>
                 <button onClick={this.saveMatches}>Guardar cuadro</button>
                 <button onClick={this.deleteMatches}>Descartar cuadro</button>
            </div>
            <h1>{this.state.competition}</h1>
            <h2>{this.state.info}</h2>
            <div className="container">
            <div className="bracket">
            <section className="round eighthfinals">
                {this.state.a.map((a,i) => (
                    <div key={Math.random()} className="winners">
                        <div className="matchups">
                            <Matchup id={(i*2)} team1={this.state.equipos[(i*4)]} team2={this.state.equipos[(i*4)+1]} onChange={this.handleEighthWinner}/>
                            <Matchup id={(i*2)+1} team1={this.state.equipos[(i*4)+2]} team2={this.state.equipos[(i*4)+3]} onChange={this.handleEighthWinner}/>
                        </div>
                        <Connector />
                    </div>
                ))}
            </section>
            <section className="round quarterfinals">
                {this.state.b.map((a, i) => (
                    <div key={Math.random()} className="winners">
                        <div className="matchups">
                            <Matchup id={i+9} team1={this.state.cuartos[(i*4)]} team2={this.state.cuartos[(i*4)+1]} onChange={this.handleQuarterWinner}/>
                            <Matchup id={i+10} team1={this.state.cuartos[(i*4)+2]} team2={this.state.cuartos[(i*4)+3]} onChange={this.handleQuarterWinner}/>
                        </div>
                        <Connector />
                    </div>
                ))}
            </section>
            <section className="round semifinals">
                <div className="winners">
                    <div className="matchups">
                        <Matchup id="13" team1={this.state.semis[0]} team2={this.state.semis[1]} onChange={this.handleSemiWinner}/>
                        <Matchup id="14" team1={this.state.semis[2]} team2={this.state.semis[3]} onChange={this.handleSemiWinner}/>
                    </div>
                    <Connector />
                </div>
            </section>
            <section className="round finals">
                <div className="winners">
                    <div className="matchups">
                        <Matchup id="15" team1={this.state.final[0]} team2={this.state.final[1]} onChange={this.handleFinalWinner}/>
                    </div>
                    <div className="connector">
                        <div className="line"></div>
                    </div>
                </div>
            </section>
            <section className="round champion">
                <div className="winners">
                    <div className="matchups">
                        <div className="matchup">
                            <div className="participants">
                                <div id="16" className={this.state.champ ? 'participant winner': 'participant'}>{this.state.champ[2] && <img src={this.state.champ[2]} width="20" height="20" />}<span>{this.state.champ[0]}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            </div>
            </div>   
            </>
        );
    }
}