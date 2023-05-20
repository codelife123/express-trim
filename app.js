const express = require('express');
const { exec } = require('child_process');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");
const cors = require('cors');
const port = process.env.PORT || 3333;

const app = express();
// Enable CORS for all routes
app.use(cors());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/trim3', async (req, res) => {
    const url = req.query.url;
    const start_time = req.query.start_time;
    const duration = req.query.duration;
    
    // Download video using ytdl-core
    const video = await ytdl(url, { quality: 'highest' });
    
    // Trim video using ffmpeg
    const command = ffmpeg(video)
        .setStartTime(82)
        .setDuration(duration)
        .outputFormat('mp4')
        .pipe();
    
    // Return trimmed video as response body
    res.setHeader('Content-Disposition', 'attachment; filename=trimmed.mp4');
    res.setHeader('Content-Type', 'video/mp4');
    command.on('error', function(err, stdout, stderr) {
        console.log('Error:', err);
        console.log('ffmpeg output:', stdout);
        console.log('ffmpeg stderr:', stderr);
        res.status(500).send('An error occurred while trimming the video.');
    });
    command.on('end', function() {
        console.log('Trimming finished successfully');
    });
    command.pipe(res);
});

app.get('/trim4',async (req,res)=>{
    
    let info = await ytdl.getInfo('bf7i6q_p7FU');
    console.log(info);
    const fs = require('fs')
    fs.writeFileSync('info.json',JSON.stringify(info),'utf8')
    
    //video trim logic goes here
    
    // video trim logic ends
    res.set('Content-Type', 'video/mp4');
    res.set('Content-Disposition', 'attachment; filename="output.mp4"');
    res.download('output.mp4', (err) => {
        if (err) {
            console.error(`Error sending trimmed video: ${err}`);
            return res.status(500).send('Error sending trimmed video');
        }
        console.log('Trimmed video sent successfully');
    });
})


app.get('/trim',async (req,res)=>{
    console.log('trim endpoint exectuted')
    const youtubeId = req.query.url.split('=')[1]
    const youtubeUrl = req.query.url
    let info = await ytdl.getInfo(youtubeId);
    if(info.hasOwnProperty('formats')){
        const downloadLink = info.formats[0].url
        console.log('downloadLink is >>> '+downloadLink);
       
        
        //video trim logic
        const startTime = req.query.start_time;
        const duration = req.query.duration;
        const outputFilename = (new Date()).getTime()+'.mp4';//req.query.filename;
    
        const command = `ffmpeg -ss ${startTime} -i "${downloadLink}" -t ${duration} -c copy ${outputFilename}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send('Error trimming video');
            }
        
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
    
    
            // video trim logic ends
            res.set('Content-Type', 'video/mp4');
            res.set('Content-Disposition', `attachment; filename="${outputFilename}"`);
            res.download(outputFilename, (err) => {
                if (err) {
                    console.error(`Error sending trimmed video: ${err}`);
                    return res.status(500).send('Error sending trimmed video');
                }
                console.log('Trimmed video sent successfully');
                // Delete the trimmed file once it's sent to the client
                exec(`rm ${outputFilename}`);
            });
            
        });
        
    
        
    
        
        
    }
    else {
        res.status(500).send('video not found')
    }
    
    
    
})

app.get('/trim2', (req, res) => {
    const youtubeUrl = req.query.url;
    const startTime = req.query.start_time;
    const duration = req.query.duration;
    const outputFilename = (new Date()).getTime()+'.mp4';//req.query.filename;
    
    const command = `ffmpeg -ss ${startTime} -i $(youtube-dl -f best -g ${youtubeUrl}) -t ${duration} -c copy ${outputFilename}`;
    console.log(command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error trimming video');
        }
        
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        
        return res.download(outputFilename, (err) => {
            if (err) {
                console.error(`Error sending trimmed video: ${err}`);
                return res.status(500).send('Error sending trimmed video');
            }
            
            console.log('Trimmed video sent successfully');
            // Delete the trimmed file once it's sent to the client
            //exec(`rm ${outputFilename}`);
        });
    });
});

app.get('/trim1', (req, res) => {
    // Same as before
    // ...
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'Error trimming video' });
        }
        
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        
        const trimmedUrl = `/${outputFilename}`;
        return res.json({ trimmedUrl });
    });
});

app.listen(port, () => {
    console.log('Server started on port 3333');
});
