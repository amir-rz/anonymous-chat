import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import random

username = random.randint(0,100000)

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        global username

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        username+=1
        self.user_name = f"anonymous{username}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                "more": text_data_json
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        
        # user = event['user']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message,
            'user_name': self.user_name
        }))

