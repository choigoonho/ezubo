ezubo
=====

Public content from ezubo.com (Ezubao), a P2P lending website.

I wrote a small program at my friend's request (before ezubo.com was shut down
by the government) to download public data from ezubo.com, including masked
cellphone numbers of buyers and descriptions of most products, to find out
whether the website is trustworthy.

There were more than 3,000 projects (products) on ezubo.com, but I only got No.
1 - 2,900 of them. The numeric file names in the `records` and `descriptions`
directory were the project IDs. `records` are lists of buyers (users) and the
money that paid of every project. `descriptions` are the descriptions of every
project.

Note: ezubo.com servers were extremely unreliable; some HTTP requests returned
incomplete list of records (not an HTTP error!) and the website accepts very
small amount of HTTP requests at the same time, so it took me a long time
getting all data I need.
