# Adding new graphics

When adding new graphics to the repository, it is important to keep the size
of the graphics down as to not make the git history excessively large, but to
also maintain high quality graphics.

For that reason, when submitting new graphics, please ensure that you run the
following command before committing graphics:

```
oxipng --opt max --strip all -Z --threads 16 <the-file.png>
```

[`oxipng`](https://github.com/shssoichiro/oxipng) is a utility to optimize PNG
files, without loss of quality. I believe the majority of the savings comes
from using the Zopfli compression algorithm, and it has reduced file sizes up
to 1/6th the size of assets at best.

## Why old graphics don't run `oxipng`

Due to the savings of `oxipng`, you would think that we would want all graphics
to be optimized. However, modifying images results in a larger git commit history,
increasing the amount of time it takes for a fresh `git clone` to execute. This
is something that we want to keep down, so we do not modify image assets unless
necessary.
