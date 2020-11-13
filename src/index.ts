import app from './app'

const port = 8080; // default port to listen

app.listen( port, () => {
    console.log(`Started on port ${port}`);
} );
