<h1 align='center'>NOMAD HYPERTEXT</h1>
<p align='center'>
<img src="https://github.com/nichwch/nomad-hypertext/assets/7423703/501d295c-b5c5-41bc-8fdc-307731439dcc" alt="drawing" width="500"/>
</p>


Nomad Hypertext is a writing app built around semantic search. Right now, it only works on Mac. 

As your write, it indexes what you write in a local vector database, using a local AI model to generate embeddings. Later, you can click on paragraphs to see related content. 

<img width="1432" alt="Screenshot 2024-01-13 at 2 50 00 PM" src="https://github.com/nichwch/nomad-hypertext/assets/7423703/66fb81fb-763f-4ccb-afa7-a66f6627a09a">

# How to use Nomad Hypertext

Just write your thoughts down! There are no tags or manual backlinks to worry about, semantic search will naturally connect related ideas on its own.

If you want to exclude something from semantic search, you can add two slashes (//) in front so the indexer will ignore it.

If you want to group multiple paragraphs together into a single block, add a ~ before and after the paragraphs you'd like to group. This is handy for grouping together song lyrics.

<img width="629" alt="tutorial" src="https://github.com/nichwch/nomad-hypertext/assets/7423703/64068de2-5028-4c48-9183-49b024778f10">

# How it works

Nomad Hypertext uses [OramaSearch](https://oramasearch.com/) for vector search, and Supabase's [gte-small model](https://huggingface.co/Supabase/gte-small) to generate embeddings. Both of these run in memory, on device, which means Nomad Hypertext does not need an internet connection to function.

# Get Nomad Hypertext

Nomad Hypertext is available for MacOS. You can download Nomad Hypertext in the [releases](https://github.com/nichwch/nomad-hypertext/releases) section. Download the arm64 version if you have an Apple Silicon mac, or the x64 version if you have an Intel mac. 

# Learn more

You can read [this](https://blog.nicholaschen.io/posts/What%20is%20Nomad%20Hypertext.txt) if you want to learn more about Nomad Hypertext. 

If you'd like to publish a blog with semantic hyperlinks, check out Nomad Hypertext's sister project, [Yurt](https://github.com/nichwch/yurt).

# Acknowledgements

Nomad Hypertext was heavily inspired by Linus Lee's [notation.app](https://notation.app/) and its corresponding essay, [Hyperlink Maximalism](https://thesephist.com/posts/hyperlink/). Gordon Brander's essay [All you need is Links](https://subconscious.substack.com/p/all-you-need-is-links) also provided a lot of inspiration.

<p align='center'>
<img src="https://github.com/nichwch/yurt/assets/7423703/ffdcd733-d4dd-4558-9b54-ea41387efabb" alt="drawing" width="500"/>
</p>


<a href='http://www.recurse.com' title='Made with love at the Recurse Center'><img src='https://cloud.githubusercontent.com/assets/2883345/11322972/9e553260-910b-11e5-8de9-a5bf00c352ef.png' height='59px'/></a>
