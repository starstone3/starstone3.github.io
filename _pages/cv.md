---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}
<aside id="sidebar" class="sidebar__right">
  <nav class="toc">
      <header>
        <h4 class="nav__title">
          <i class="fa fa-{{ include.icon | default: 'file-text' }}"></i> 
          {{ include.title | default: site.data.ui-text[site.locale].toc_label }}
        </h4>
      </header>
    <div class="toc__menu">
      <ul>
        <li><a href="#education">Education</a></li>
        <li><a href="#work-experience">Work experience</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#publications">Publications</a></li>
        <li><a href="#talks">Talks</a></li>
        <li><a href="#teaching">Teaching</a></li>
        <li><a href="#service-and-leadership">Service and leadership</a></li>
      </ul>
    </div>
  </nav>
</aside>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var sidebar = document.getElementById("sidebar");
    var sidebarTop = sidebar.offsetTop;

    window.onscroll = function() {
      if (window.pageYOffset > sidebarTop) {
        sidebar.style.position = "fixed";
        sidebar.style.top = "10px";
        sidebar.style.right = "10px";
        sidebar.style.width = "200px";
      } else {
        sidebar.style.position = "static";
        sidebar.style.width = "auto";
      }
    };
  });
</script>
# Education

* Ph.D in Version Control Theory, GitHub University, 2018 (expected)
* M.S. in Jekyll, GitHub University, 2014
* B.S. in GitHub, GitHub University, 2012

# Work experience

* Spring 2024: Academic Pages Collaborator
  * Github University
  * Duties includes: Updates and improvements to template
  * Supervisor: The Users

* Fall 2015: Research Assistant
  * Github University
  * Duties included: Merging pull requests
  * Supervisor: Professor Hub

* Summer 2015: Research Assistant
  * Github University
  * Duties included: Tagging issues
  * Supervisor: Professor Git

# Skills
* Skill 1
* Skill 2
  * Sub-skill 2.1
  * Sub-skill 2.2
  * Sub-skill 2.3
* Skill 3

# Publications
  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

# Talks
  <ul>{% for post in site.talks reversed %}
    {% include archive-single-talk-cv.html  %}
  {% endfor %}</ul>

# Teaching
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

# Service and leadership
* Currently signed in to 43 different slack teams
