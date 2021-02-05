require('dotenv').config()


var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    cors = require('cors');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const hubspot = require('@hubspot/api-client')
const hubspotClient = new hubspot.Client({ apiKey: process.env.HUBSPOT_KEY })

async function queryHubspotForUserEmailWithUserId(userId) {
    try {
        const email = await hubspotClient.crm.contacts.basicApi.getById(userId)
        return email.body.properties.email
    } catch {
        return ""
    }
    
}

async function queryHubspotForUserWithConversationId(taskId) {
    const contact = await hubspotClient.crm.associations.batchApi.read("conversations", "contact", { inputs: [{ id: taskId }] })
    if (contact.body.errors == undefined && contact.body.status == 'COMPLETE') {
        if (contact.body.results.length >= 1 && contact.body.results[0].to.length >= 1) {
            var contact_id = contact.body.results[0].to[0].id
            try {
                //var email = await queryHubspotForUserEmailWithUserId("12434213")
                var email = await queryHubspotForUserEmailWithUserId(contact_id)
                return email
            } catch {
                return ""
            }
        }
    } else {
        return ""
    }
}

app.route('/conversations/:conversationId')
    .get(async function (req, res) {
        try {
            var email = await queryHubspotForUserWithConversationId(req.params.conversationId)
            res.jsonp(email)
        } catch {
            res.jsonp("")
        }
    });

app.listen(port);

console.log('Sprout-HS RESTful API server started on: ' + port);