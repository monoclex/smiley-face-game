//@ts-check
import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

const TermsAndConditions = () => {
  // TODO: markdown to material-ui?
  // some of the license borroed from https://storybird.com/terms-of-service
  // TODO: refine document to be "more legal" later i guess?
  // TODO: use parts from discord's license
  // TODO: define the "Game" differently. currently it refers to smiley face game and the discord,
  // but we may not have legal control over the discord
  // TODO: can we bind users to a terms and conditions upon using a discord server?
  return (
    <Container component="main" maxWidth="sm">
      <Typography variant="h3" component="h1">
        Terms and Conditions
      </Typography>
      <Typography variant="body1" component="p">
        Smiley Face Game ("Smiley Face Game," "us," "our," and "we") owns and operates the Smiley Face Game website, related mobile apps,
        and the Smiley Face Game Discord server (together, the "Game"). By accessing or using the Game in any way or by creating an account
        to use the Game and becoming a User, users ("you,", "your") agree to abide by these Terms of Use. These Terms of Use and any other
        terms, policy, or other document incorporated in these terms and conditions by reference are a legally binding agreement between us
        (the "Agreement").
      </Typography>
      {/* https://discord.com/terms - 13+ policy */}
      <Typography variant="body1" component="p">
        In addition, you agree (i) that you are 13 years of age and the minimum age of digital consent in your country, (ii) if you are the
        age of majority in your jurisdiction or over, that you have read, understood, and accept to be bound by the Terms, and (iii) if you
        are between 13 (or the minimum age of digital consent, as applicable) and the age of majority in your jurisdiction, that your legal
        guardian has reviewed and agrees to these Terms.
      </Typography>

      <Typography variant="subtitle1" component="h2">
        User Generated Content
      </Typography>
      <Typography variant="body1" component="p">
        The Game allows Users to create their own level, and to share those levels through the Game with other Users. Smiley Face Game also
        allows Users to supply graphic/music/sound assets to the Game. In this Agreement we refer to all of this content provided by Users
        as "User Content".
      </Typography>
      <Typography variant="body1" component="p">
        In order for us to make the User Content you contribute available on the Game for these purposes, and to operate, market, and
        promote the Game, we need the right to make use of such User Content in accordance with and subject to this Agreement.
      </Typography>
      <Typography variant="body1" component="p">
        Therefore, by contributing User Content to the Game or creating it on the Game you automatically grant us an irrevocable and
        perpetual, non-exclusive, transferable, fully-paid, royalty-free, worldwide license, by ourselves or with others, to use, copy,
        distribute, publicly perform, publicly display, print, publish, republish, excerpt (in whole or in part), reformat, translate,
        modify, revise, and incorporate into other works, that User Content and any works derived from taht User Content, in any form of
        media or expression, in the manner in which the Game from time to time permits User Content to be used.
      </Typography>
      <Typography variant="body1" component="p">
        This license also grants us the right to sublicense that User Content to other Users to permit their use of that User Content in
        which the Game from time to time permits User Content to be used.
      </Typography>
    </Container>
  );
};

export default TermsAndConditions;
