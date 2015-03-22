"use strict"

var SimpleFilterableList	= React.createClass({
	mixins: [ReactFireMixin],
	componentDidMount: function() {
		this.bindAsArray(new Firebase("https://platzi-realtimelist.firebaseio.com/"), "simpleList");
		console.log('_________________');
		console.log('Firebase array binded');
		console.log(this);
	},
	getInitialState: function() {
        return {
			userInput: "",
			simpleList: [
				{
					row: 'cargando	...'
				}
			]
        };
    },
	updateUserInput: function(input){
		console.log('_________________');
		console.log('User search input:');
		console.log(input.target.value);
		this.setState({userInput: input.target.value});
	},
	favToInput: function(){
		console.log('_________________');
		console.log('Convertig fav to input');
		document.getElementById("newElement").className 	= '';
		document.getElementById("newElement").placeholder	= 'Agregar nuevo paso...';
	},
	sendNewElement: function(key){
		if (key.key == "Enter"){
			console.log('_________________');
			console.log('Sending new element:');
			console.log(document.getElementById('newElement').value);
			console.log('_________________');
			console.log('Convertig input to fav');
			this.firebaseRefs['simpleList'].push({
				row: document.getElementById('newElement').value
			});
			document.getElementById('newElement').value 		= '';
			document.getElementById("newElement").className		= 'fav';
			document.getElementById("newElement").placeholder	= "+";
			document.getElementById("userInput").focus();
		};
	},
	render: function(){
		return (
			<div>
				<input
					id			='userInput'
					type		='text'	
					placeholder	='Filtrar...'	
					onChange	={this.updateUserInput}>
				</input>
				<SimpleList	
					simpleList	={this.state.simpleList}
					userInput	={this.state.userInput}/>
				<input
					id			='newElement'
					type		='text'	
					placeholder	='+' 			
					onKeyPress	={this.sendNewElement}	
					onClick		={this.favToInput}
					className	='fav'>
				</input>
			</div>
		);
	}
});

var SimpleList = React.createClass({
	render: function() {
		return (
			<span>
				<p><strong>Pasos para dominar un nuevo lenguaje de programación:</strong></p>
				<SimpleListRow 
					simpleList={this.props.simpleList} 
					userInput={this.props.userInput}/>
			</span>
		);
	}	
});

var SimpleListRow = React.createClass({
	render: function() {
		console.log('_________________');
		console.log('simpleList rows props:');
		console.log(this.props);
		var rows = this.props.simpleList;
		var userInput = this.props.userInput;
		return (
			<ol>
				{rows.map(function(element) 
					{if (element.row.toLowerCase().search(userInput.toLowerCase()) > -1){
						console.log('userInput found in simpleList row: '+element.row);
						return (
							<li>{element.row}</li>
						);
					};
				})}
			</ol>
		);
	}	
});

React.render(
	<SimpleFilterableList />,
	document.getElementById('simpleList')
)