var searchone = 0
var searchtext
var totalpages
var nowpage = 1
var $root

function new_render_md(regular_toc, abbrlink) {
    $('#docpanel').remove()
    $('#articles_side_panel').remove()
    $('#md').addClass('article')
    let as = $('#md a')
    for (let i = 0; i < as.length; i++) {
        as[i].target = '_blank'
    }
    $('.reference-link').each(function() {
        this.setAttribute('name', this.getAttribute('name').replace(/\s*$/g, ''))
    })
    $('.gifbtn').each(function() {
        bindev(this, 'click', function() {
            let noshow = this.getAttribute('show') === 'no'
            if (noshow) {
                $(this).after('<img id="' + this.innerText.substring(0, this.innerText.length - 4) + '" src="' + this.getAttribute('lk') + '"></img>')
                this.setAttribute('show', 'yes')
            } else {
                $('#' + this.innerText.substring(0, this.innerText.length - 4)).remove()
                this.setAttribute('show', 'no')
            }
        })
    })
    let listhtml = ''
    let selectheaderstr = Boolean(regular_toc) ? 'h1, h2, h3, h4, h5, h6' : 'h2, h3'
    let selectheader = $(selectheaderstr)
    $('#sidetoc').append(`
        <ul id="_toc_root">
        </ul>
    `)

    if (Boolean(regular_toc)) {
        let h1s = $('h1')
        let h2s = $('h2')
        let h3s = $('h3')
        let h4s = $('h4')
        let addhr
        if (h1s.length > 0) {
            addhr = h1s
        } else if (h2s.length > 0) {
            addhr = h2s
        } else if (h3s.length > 0) {
            addhr = h3s
        } else if (h4s.length > 0) {
            addhr = h4s
        }
        if (addhr !== undefined) {
            addhr.after(`
                <hr class="headhr">
            `)
        }
    }

    function limaker(text, id, tg) {
        let transferred = text
            .trim()
            .replace(/>/gm, '&gt;')
            .replace(/</gm, '&lt;')
            .replace(/&/gm, '&amp;')
            .replace(/"/gm, '&quot;')
            .replace(/ /gm, '&nbsp;')
        if (tg.toLowerCase() === 'h2') {
            transferred = '⭐ ' + transferred
        }
        return `
            <li class="toc-${tg.toLowerCase()}" _target_sb="${id}">
                <a hreff="${id}">${transferred}</a>
                <ul id="_toc_${id}" class="_toc_ul">
                </ul>
            </li>
        `
    }
    for (let i = 0; i < selectheader.length; i++) {
        let el = selectheader[i]
        if (i === 0) {
            $('#_toc_root').append(limaker(el.innerText, el.id, el.tagName))
            el.setAttribute('roottocid', '_toc_root')
        } else {
            let pre = selectheader[i - 1]
            if (el.tagName === pre.tagName) {
                let preroottocid = pre.getAttribute('roottocid')
                $(`#${preroottocid}`).append(limaker(el.innerText, el.id, el.tagName))
                el.setAttribute('roottocid', preroottocid)
            } else if (el.tagName < pre.tagName) {
                while (pre.tagName > el.tagName) {
                    if (pre.getAttribute('roottocid') === '_toc_root') {
                        break
                    }
                    pre = $(`#${pre.getAttribute('roottocid').replace('_toc_', '')}`)[0]
                }
                let roottocid = pre.getAttribute('roottocid')
                $(`#${roottocid}`).append(limaker(el.innerText, el.id, el.tagName))
                el.setAttribute('roottocid', roottocid)
            } else {
                $(`#_toc_${pre.id}`).append(limaker(el.innerText, el.id, el.tagName))
                el.setAttribute('roottocid', '_toc_' + pre.id)
            }
        }
    }
    $('#sidetoc').append(listhtml)
    if (Boolean(regular_toc)) {
        $('.markdown-toc a').click(function() {
            let tzhref = $.attr(this, 'hreff')
            scrollToElement(tzhref)
        })
    } else {
        $('.markdown-toc .toc-h3').click(function() {
            $('.tocactive').removeClass('tocactive')
            $(this).addClass('tocactive')

            let tgsbid = this.getAttribute('_target_sb')

            let showsb = $('#md .show-script-block')
            showsb.removeClass('show-script-block')
            showsb.addClass('hide-script-block')

            let tgsb = $(`#${tgsbid}`).next()
            tgsb.removeClass('hide-script-block')
            tgsb.addClass('show-script-block')

            let showh3 = $('#md .no-zip-tran')
            showh3.removeClass('no-zip-tran')
            showh3.addClass('zip-tran')

            let tgsbh3 = tgsb.prev('h3')
            tgsbh3.removeClass('zip-tran')
            tgsbh3.addClass('no-zip-tran')

            tgsb.find('img').each((i, e) => {
                if (e.getAttribute('shown') !== 'true') {
                    let pics = $(`[picid=${e.getAttribute('picid')}]`)
                    pics.attr('src', pics.attr('href'))
                    pics.attr('shown', 'true')
                    pics.on('load', function(event) {
                        pics.removeClass('hidepic')
                        $(`._showpic_${e.getAttribute('picid')}`).remove()
                    })
                }
            })
        })

        $('#sidetoc').addClass('scripts-toc')
        $('._toc_ul').addClass('myhide')
        $('._toc_ul').each((i, e) => {
            e.style.height = e.childElementCount * 22 + (e.childElementCount + 1) * 4 + 'px'
        })

        let nowh2
        $('#sidetoc .toc-h2>a').click(function(event) {
            if(!Boolean(this.getAttribute('got'))) {
                getScriptsHtm(this.getAttribute('hreff'))
                this.setAttribute('got', true)
            }
            if (nowh2 === undefined) {
                $(this).siblings('._toc_ul').removeClass('myhide')
            } else if (nowh2 === this) {
                if ($(this).siblings('._toc_ul').hasClass('myhide')) {
                    $(this).siblings('._toc_ul').removeClass('myhide')
                } else {
                    $(this).siblings('._toc_ul').addClass('myhide')
                }
            } else {
                $(nowh2).siblings('._toc_ul').addClass('myhide')
                $(this).siblings('._toc_ul').removeClass('myhide')
            }
            nowh2 = this
        })
    }
    $('.katex-display').addClass('katexp')
    let ktxdisplay = $('.katex-display').next()
    if (ktxdisplay.length > 0) {
        for (jq of ktxdisplay) {
            if (jq.tagName === 'BR') {
                $(jq).remove()
            }
        }
    }
    setimgclicktofocus()
    highlightBlock()
    $('.language-console').each((i, e) => {
        $(e).parent().addClass('seboxhide')
        $(e).parent().before(`
            <div class="showconsole">Show output &gt;&gt;&gt;</div>
        `)
    })
    $('.showconsole').click(function() {
        $(this).next().removeClass('seboxhide')
        $(this).next().css('border-left', 'none !important;')
        $(this).remove()
    })

    if (Boolean(abbrlink)) {
        let end = `
        <br>
        <div class="copyrightbox">
            <span style="font-weight:bold;font-size:18px;">Copyright Notices:</span>
            <br>
            Articles address: <a href="javascript:void(0);">https://youyinnn.github.io/article/${abbrlink}.html</a>
            <hr>
            1. All articles on this blog was powered by <span style="font-weight:bold;">youyinnn</span>@[<a href="javascript:void(0);">https://github.com/youyinnn</a>].
            <br>
            2. For reprint please contact the author@[<a href="mailto:youyinnn@gmail.com">youyinnn@gmail.com</a>] or comment below.
        </div>
        <div id="movebtn" class="mb-5">
            <button id="nextarticlebtn" class="btn btn-dark disabled" style="float: left" data-toggle="tooltip" data-trigger="manual" data-placement="right" data-original-title="" >Next</button>
            <button id="prearticlebtn" class="btn btn-dark disabled" style="float: right" data-trigger="manual" data-toggle="tooltip" data-placement="left" data-original-title="">Previous</button>
        </div>
        <div id="vcomments"></div>
        <div id="footer">2017-${new Date().getFullYear()}</div>
        `
        $(md).append(end)
    }

    setTimeout(() => {
        rmclass(md, 'myhide')
        adclass(md, 'myshow')
        $(md).addClass('animate__animated animate__fadeIn')
        if (!location.pathname.startsWith('/scripts/')) {
            scrollToElement(hash.replace('#', ''))
        }
        let flows = $('.language-flow')

        function renderfc() {
            try {
                if (flowchart) {}
                for (flowel of flows) {
                    let id = '_fc' + new Date().getTime()
                    $(flowel).parent().before(`
                        <div id="${id}" class="md-diagram-panel-preview">
                        </div>
                    `)
                    let chart = flowchart.parse(flowel.innerText)
                    $(flowel).parent().remove()
                    chart.drawSVG(id, {
                        theme: "simple"
                    });
                }
            } catch (e) {
                console.info('Flowchart.js is not avaliable.');
                console.debug(e);
            }
        }
        if (flows.length > 0) {
            let fcrs = [{
                    url: 'https://cdn.jsdelivr.net/npm/raphael@2.3.0/raphael.min.js',
                    target: ['/article/', '/todos/', '/scripts/'],
                    attrs: {
                        defer: true
                    }
                },
                {
                    url: 'https://cdn.jsdelivr.net/gh/youyinnn/youyinnn.github.io@latest/lib/my-flowchart-1.13.0.min.js',
                    target: ['/article/', '/todos/', '/scripts/'],
                    attrs: {
                        defer: true
                    },
                    callback: renderfc
                }
            ]
            for (rs of fcrs) {
                loadIfIsTarget(rs)
            }
        }
    }, 200)
}

function get_articles() {
    $('#pgboxbox').remove()
    $('.treenode').remove()
    $('.stgt.btn').remove()
    all_cates = new Array()
    all_tags = new Array()
    $('#blog_statistic_body').addClass('myhide')
    // from localStorage
    let pcbl = sessionStorage.getItem('pcbl')
    handlemetadata(jsyaml.load(pcbl))
}

function scrollToElement(id) {
    if ($root === undefined) {
        $root = $('html, body')
    }
    if (id.trim() !== '') {
        $root.animate({
            scrollTop: $('#' + id).offset().top - 15
        }, 700, 'swing')
    }
}

function highlightBlock() {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    })
    for (pre of $('pre')) {
        if (pre.innerText.trim().length === 0)
            $(pre).remove()
    }
}

function articlespage(pageto) {
    docpanel.style.cssText = 'transform: translateY(-' + ((articlepanelheight - 48) * (pageto - 1)) + 'px);'
}

function hidesidetoc() {
    adclass(sidetoccontainer, 'tochide')
    rmclass(sidetoccontainer, 'tocshow')
    scriptsearcher.style.left = '0%'
    if (getclientw() < 700) {
        md.style.filter = ''
    }
}

function showsidetoc() {
    rmclass(sidetoccontainer, 'tochide')
    adclass(sidetoccontainer, 'tocshow')
    scriptsearcher.style.left = '-23%'
    if (getclientw() < 700) {
        md.style.filter = 'blur(2px)'
    }
}

function setgohub(text, href) {
    gohub.innerText = text
    gohub.href = href
}

function changepagetitle(text) {
    $('title')[0].innerText = text
}

function gethexofrontmatter(text) {
    if (text.substring(0, 3) === '---') {
        let endindex = text.indexOf('---', 3) + 3
        let hexo_metadata = text.substring(4, endindex - 3)
        return hexo_metadata
    }
}

function getbodyfrommdtext(mdtext) {
    if (mdtext.substring(0, 3) === '---') {
        let endindex = mdtext.indexOf('---', 3) + 3
        let body = mdtext.substring(endindex, mdtext.length)
        return body
    }
    return mdtext
}

function getdocwithnohexofrontmatter(text) {
    if (text.substring(0, 3) === '---') {
        let endindex = text.indexOf('---', 3) + 3
        let body = text.substring(endindex, text.length)
        return body
    } else {
        return text
    }
}

var pcbl_timeout_period = 24 * 60 * 60 * 1000

function searchprocessbarshow() {
    $('#searchprocessbar').addClass('opshow')
    $('#spb-out').addClass('spb-outter-animate')
    $('#spb-in').addClass('spb-inner-animate')
}

let searchrscountshowclear

function searchprocessbarhide() {
    $('#searchprocessbar').removeClass('opshow')
    $('#spb-out').removeClass('spb-outter-animate')
    $('#spb-in').removeClass('spb-inner-animate')
    $('#searchrscount').addClass('opshow')
    clearTimeout(searchrscountshowclear)
    searchrscountshowclear = setTimeout(() => {
        $('#searchrscount').removeClass('opshow')
    }, 5000)
}

$('#searchrscount').text('3 hits matching in 4ms')

function searcharticle(text) {
    searchprocessbarshow()
    // search
    if (text !== '') {
        let start = new Date().getTime()
        text = text.replace(/\s/gm, '')
        let rs = new Set()
        index.search(text, {
            typoTolerance: false
        }).then(({
            hits,
            nbHits
        }) => {
            searchprocessbarhide()
            for (let i = 0; i < hits.length; i++) {
                rs.add(hits[i].objectID)
            }
            // handle rs
            if (filter_articles_cache.length === 0) {
                for (let i = 0; i < articles_cache.length; i++) {
                    if (rs.has(articles_cache[i].abbrlink)) {
                        articlesearchrs.push(articles_cache[i])
                    }
                }
            } else {
                for (let i = 0; i < filter_articles_cache.length; i++) {
                    if (rs.has(filter_articles_cache[i].abbrlink)) {
                        articlesearchrs.push(filter_articles_cache[i])
                    }
                }
            }
            let finish = new Date().getTime()
            $('#searchrscount').text(`${articlesearchrs.length} hits matching in ${finish - start} ms`)
            if (articlesearchrs.length === 0) {
                $('#articlesearchtext').addClass('getnothing')
                setTimeout(function() {
                    $('#articlesearchtext').removeClass('getnothing')
                }, 1000, 'swing')
            } else {
                $('#pgboxbox').remove()
                $('.pagination').remove()
                rstopaging(articlesearchrs)
                articlesearchrs = new Array()
            }
        }).catch(function(err) {
            console.err(err)
            popmsg('Search faild.')
        })
    } else {
        cleansearch()
    }
}

function articlesmetadatahandle(articlemetadata) {
    let articlecache = articlemetadata
    if (articlecache.categories !== undefined) {
        let cid = ''
        let pid = ''
        for (let i = 0; i < articlecache.categories.length; i++) {
            // handle cates_tree_body
            pid = cid
            cid += articlecache.categories[i]
            let cate = b64.encode(cid, true)
            if ($('#' + cate + '_treenode').length === 0) {
                let node = c('li')
                node.id = cate + '_treenode'
                adclass(node, 'treenode')
                let noa = c('div')
                noa.innerText = articlecache.categories[i]
                $(noa).bind('click', function(event) {
                    catetreenodeclick(this, true)
                })
                appendc(node, noa)
                // root category add on cates_tree_body directly
                if (i === 0) {
                    appendliwithorder(cates_tree_body, node)
                } else {
                    // if not find parent root element and add child element
                    let parentnodeid = b64.encode(pid, true)
                    appendliwithorder($('#' + parentnodeid + '_treenode')[0], node)
                }
            }

            // handle cates panel
            let haved = false
            for (let j = 0; j < all_cates.length; j++) {
                if (all_cates[j] === articlecache.categories[i]) {
                    haved = true
                }
            }
            if (!haved) {
                all_cates.push(articlecache.categories[i])
            }
        }
    }
    // handle tags panel
    if (articlecache.tags !== undefined) {
        for (let i = 0; i < articlecache.tags.length; i++) {
            let haved = false
            for (let j = 0; j < all_tags.length; j++) {
                if (all_tags[j] === articlecache.tags[i]) {
                    haved = true
                }
            }
            if (!haved) {
                all_tags.push(articlecache.tags[i])
            }
        }
    }
}

// set order by string natural order for categories panel
function appendliwithorder(parentelement, newchildelement) {
    let cns = parentelement.childNodes
    let newchildcatename = b64.decode(newchildelement.id.split('_')[0])
    for (let i = 0; i < cns.length; i++) {
        if (cns[i].tagName === 'LI') {
            let brothercatename = b64.decode(cns[i].id.split('_')[0])
            if (brothercatename > newchildcatename) {
                $(cns[i]).before(newchildelement)
                return
            }
        }
    }
    $(parentelement).append(newchildelement)
}

function catetagclick(catetag, isfilter) {
    let stgcs = $('.stgc')
    let stgts = $('.stgt')
    if (hasclass(catetag, 'btn-light')) {
        filter_articles_cache = new Array()
        stgts.attr('disabled', true)
        stgcs.attr('disabled', true)
        rmclass(catetag, 'btn-light')
        catetag.disabled = false
        adclass(catetag, 'btn-success')
        for (let k = 0; k < articles_cache.length; k++) {
            for (let l = 0; l < articles_cache[k].categories.length; l++) {
                if (articles_cache[k].categories[l] === catetag.innerText) {
                    filter_articles_cache.push(articles_cache[k])
                }
            }
        }
    } else {
        stgts.attr('disabled', false)
        stgcs.attr('disabled', false)
        rmclass(catetag, 'btn-success')
        adclass(catetag, 'btn-light')
    }
    if (isfilter) {
        filter()
    }
    scrollToTop(0)
    $('#articlesearchtext').val('')
}

function catetreenodeclick(catenode, isfilter) {
    let decodeC = b64.decode(catenode.parentNode.id.split('_')[0]);
    if (!hasclass(catenode, 'adisable')) {
        filter_articles_cache = new Array()
        if (!catenode.asel) {
            catenode.asel = true
            $('#cates_tree_body div').addClass('adisable')
            rmclass(catenode, 'adisable')
            let pid = ''
            for (let k = 0; k < articles_cache.length; k++) {
                let tmp = pid
                for (let l = 0; l < articles_cache[k].categories.length; l++) {
                    pid += articles_cache[k].categories[l]
                    if (pid === decodeC) {
                        filter_articles_cache.push(articles_cache[k])
                    }
                }
                pid = tmp
            }
            $('.stgt').attr('disabled', true)
        } else {
            catenode.asel = false
            $('.stgt').attr('disabled', false)
            $('#cates_tree_body div').removeClass('adisable')
        }
        if (isfilter) {
            filter()
        }
    }
    scrollToTop(0)
}

function filter() {
    nowpage = 1
    $('#pgboxbox').addClass('pageboxhide')
    $('.pagination').addClass('myhide')
    setTimeout(function() {
        $('#pgboxbox').remove()
        $('.pagination').remove()
        let pc
        if (filter_articles_cache.length === 0) {
            pc = articles_cache
        } else {
            pc = filter_articles_cache
        }
        if (articlesod) {
            pc = pc.sort(sortarticlebyupdatedate)
        } else {
            pc = pc.sort(sortarticlebycreatedate)
        }
        rstopaging(pc)
        articlesearchrs = new Array()
    }, 100);
}

function sortarticlebyupdatedate(a, b) {
    return a.updated_at > b.updated_at ? -1 :
        a.updated_at === b.updated_at ? 0 : 1
}

function sortarticlebycreatedate(a, b) {
    return a.created_at > b.created_at ? -1 :
        a.created_at === b.created_at ? 0 : 1
}

function rstopaging(articles) {
    let totalpages = Math.ceil(articles.length / perpageitem)
    let pagesboxs = new Array(totalpages)
    let pageboxbox = c('div')
    pageboxbox.id = 'pgboxbox'
    adclass(pageboxbox, 'myhide')
    appendc(docpanel, pageboxbox)
    for (let i = 0; i < totalpages; i++) {
        let pagebox = c('div')
        adclass(pagebox, 'pagebox')
        pagebox.id = 'pagebox-' + (i + 1)
        appendc(pageboxbox, pagebox)
        pagesboxs[i] = pagebox
    }
    for (let i = 0; i < articles.length; ++i) {
        createarticlecard(articles[i], Math.ceil((i + 1) / perpageitem))
    }
    let as = $('.articleshortmsg a')
    for (let i = 0; i < as.length; i++) {
        as[i].target = '_blank'
    }
    $('.reference-link').each(function() {
        this.setAttribute('name', this.getAttribute('name').replace(/\s*$/g, ''))
    })
    $('.gifbtn').each(function() {
        bindev(this, 'click', function() {
            let noshow = this.getAttribute('show') === 'no'
            if (noshow) {
                $(this).after('<img id="' + this.innerText.substring(0, this.innerText.length - 4) + '" src="' + this.getAttribute('lk') + '"></img>')
                this.setAttribute('show', 'yes')
            } else {
                $('#' + this.innerText.substring(0, this.innerText.length - 4)).remove()
                this.setAttribute('show', 'no')
            }
        })
    })
    window.totalpages = totalpages
    rmclass(pageboxbox, 'myhide')
    adclass(pageboxbox, 'animate__animated animate__fadeIn')
    pagination()
}

function scrollToTop(interval) {
    $('html').animate({
        scrollTop: 0
    }, interval);
}

function pagination() {
    function pageFlesh() {
        if ($('html').scrollTop() > 0) {
            scrollToTop(300)
            $('#pagebox-' + nowpage).addClass('animate__animated animate__fadeInDown')
        } else {
            $('#pagebox-' + nowpage).addClass('animate__animated animate__fadeIn')
        }
    }

    nowpage = 1
    let pbs = $('.pagebox')
    for (let i = 1; i < pbs.length; i++) {
        adclass(pbs[i], 'pageboxhide')
    }
    let pnbox = c('div')
    pnbox.id = 'pnbox'
    let pn = c('ul')
    adclass(pn, 'pagination unselectable')
    adclass(pn, 'myhide')

    let first = c('li')
    first.id = 'fpg'
    adclass(first, 'page-item')
    let firstl = c('div')
    adclass(firstl, 'page-link')
    firstl.innerText = '<<'
    appendc(first, firstl)
    appendc(pn, first)
    $(first).bind('click', function(ev) {
        if (totalpages !== 0 && nowpage !== 1) {
            if (totalpages > 3) {
                $('#pg-1 > div')[0].innerText = 1
                $('#pg-2 > div')[0].innerText = 2
                $('#pg-3 > div')[0].innerText = 3
            }
            adclass($('#pagebox-' + nowpage)[0], 'pageboxhide')
            rmclass($('#pagebox-' + 1)[0], 'pageboxhide')
            rmclass($('.active')[0], 'active')
            adclass($('#pg-' + 1)[0], 'active')
            nowpage = 1
            pageFlesh()
        }
    })

    let pre = c('li')
    pre.id = 'ppg'
    adclass(pre, 'page-item')
    adclass(pre, 'page-item')
    let prel = c('div')
    adclass(prel, 'page-link')
    prel.innerText = '<'
    appendc(pre, prel)
    appendc(pn, pre)
    $(pre).bind('click', function(ev) {
        if (totalpages !== 0 && nowpage !== 1) {
            if ($('#pg-1').hasClass('active')) {
                $('#pg-1 > div')[0].innerText = parseInt($('#pg-1 > div')[0].innerText) - 1
                $('#pg-2 > div')[0].innerText = parseInt($('#pg-2 > div')[0].innerText) - 1
                $('#pg-3 > div')[0].innerText = parseInt($('#pg-3 > div')[0].innerText) - 1
            }
            adclass($('#pagebox-' + nowpage)[0], 'pageboxhide')
            rmclass($('#pagebox-' + (nowpage - 1))[0], 'pageboxhide')
            let nonum = Number($('.active')[0].id.split('-')[1])
            if (nonum > 1) {
                $('.active').removeClass('active')
                $('#pg-' + (--nonum)).addClass('active')
            }
            nowpage--
            pageFlesh()
        }
    })

    for (let i = 0; i < pbs.length; i++) {
        if (i > 2) break
        let pg = c('li')
        pg.id = 'pg-' + (i + 1)
        adclass(pg, 'page-item')
        let pgl = c('div')
        adclass(pgl, 'page-link')
        pgl.style.width = '41px'
        pgl.innerHTML = i + 1
        if (i === 0) {
            adclass(pg, 'active')
        }
        appendc(pg, pgl)
        appendc(pn, pg)
        $(pg).bind('click', function(ev) {
            let clickpg = parseInt(this.innerText)
            if (clickpg !== nowpage) {
                adclass($('#pagebox-' + nowpage)[0], 'pageboxhide')
                rmclass($('#pagebox-' + clickpg)[0], 'pageboxhide')
                rmclass($('.active')[0], 'active')
                adclass($('#pg-' + this.id.split('-')[1])[0], 'active')
                nowpage = clickpg
                pageFlesh()
            }
        })
    }

    let next = c('li')
    next.id = 'npg'
    adclass(next, 'page-item')
    let nextl = c('div')
    adclass(nextl, 'page-link')
    nextl.innerText = '>'
    appendc(next, nextl)
    appendc(pn, next)
    $(next).bind('click', function(ev) {
        if (totalpages !== 0 && nowpage !== totalpages) {
            if ($('#pg-3').hasClass('active')) {
                $('#pg-1 > div')[0].innerText = parseInt($('#pg-1 > div')[0].innerText) + 1
                $('#pg-2 > div')[0].innerText = parseInt($('#pg-2 > div')[0].innerText) + 1
                $('#pg-3 > div')[0].innerText = parseInt($('#pg-3 > div')[0].innerText) + 1
            }
            let nonum = Number($('.active')[0].id.split('-')[1])
            if (nonum < 3) {
                $('.active').removeClass('active')
                $('#pg-' + (++nonum)).addClass('active')
            }
            adclass($('#pagebox-' + nowpage)[0], 'pageboxhide')
            rmclass($('#pagebox-' + (nowpage + 1))[0], 'pageboxhide')
            nowpage++
            pageFlesh()
        }
    })

    let last = c('li')
    last.id = 'lpg'
    adclass(last, 'page-item')
    let lastl = c('div')
    adclass(lastl, 'page-link')
    lastl.innerText = '>>'
    appendc(last, lastl)
    appendc(pn, last)
    $(last).bind('click', function(ev) {
        if (totalpages !== 0 && nowpage !== totalpages) {
            adclass($('#pagebox-' + nowpage)[0], 'pageboxhide')
            rmclass($('#pagebox-' + totalpages)[0], 'pageboxhide')
            rmclass($('.active')[0], 'active')
            if (totalpages >= 3) {
                adclass($('#pg-3')[0], 'active')
                $('#pg-1 > div')[0].innerText = totalpages - 2
                $('#pg-2 > div')[0].innerText = totalpages - 1
                $('#pg-3 > div')[0].innerText = totalpages
            } else {
                adclass($('#pg-2')[0], 'active')
            }
            nowpage = totalpages
            pageFlesh()
        }
    })

    let totalli = c('li')
    totalli.id = 'ttp'
    adclass(totalli, 'page-item disabled')
    let totaldiv = c('div')
    adclass(totaldiv, 'page-link')
    totaldiv.innerText = 'All ' + totalpages + ' Pages'
    appendc(totalli, totaldiv)
    appendc(pn, totalli)
    appendc(pnbox, pn)

    appendc($('#pgboxbox')[0], pnbox)
    setTimeout(function() {
        rmclass(pn, 'myhide')
    }, 100)
}

function cleansearch() {
    searchprocessbarhide()
    $('#pgboxbox').remove()
    $('.pagination').remove()
    $('#searchrscount').removeClass('opshow')
    if (filter_articles_cache.length !== 0) {
        rstopaging(filter_articles_cache)
    } else {
        rstopaging(articles_cache)
        filter_articles_cache = new Array()
        let stgts = $('.stgt')
        let stgcs = $('.stgc')
        for (let j = 0; j < stgcs.length; j++) {
            if (stgcs[j].disabled === false) {
                rmclass(stgcs[j], 'btn-success')
                adclass(stgcs[j], 'btn-light')
            }
            stgcs[j].disabled = false
        }
        for (let j = 0; j < stgts.length; j++) {
            if (stgts[j].disabled === false) {
                rmclass(stgts[j], 'btn-info')
                adclass(stgts[j], 'btn-light')
            }
            stgts[j].disabled = false
        }
    }
    articlesearchrs = new Array()
}

function showbbt() {
    setTimeout(() => {
        $('#bbt').removeClass('myhide')
    }, 400)
}

function showtocbtn(open) {
    setTimeout(() => {
        $('#toc')[0].style.display = 'inline-block'
        $('#toc').removeClass('myhide')
        if (Boolean(open)) {
            $('#toc').click()
        }
    }, 400)
}

function hidetopbar() {
    adclass(topbar, 'hidetopbar')
}

function showtopbar() {
    rmclass(topbar, 'hidetopbar')
}

function cgtopbut() {
    if (location.pathname.startsWith('/article/') ||
        location.pathname.startsWith('/resume/') ||
        location.pathname.startsWith('/todos/')) {
        if (hasclass(topbar, 'hidetopbar')) {
            showtopbar()
        } else {
            hidetopbar()
        }
    }
}

function setimgclicktofocus() {
    let articleimgs = $('.article img')
    articleimgs.attr('title', 'click to focus')
    articleimgs.bind('click', function() {
        let w = getclientw()
        let h = getclienth()
        let fixw = w * 0.85
        let fixh = h * 0.85
        let imgw = this.naturalWidth
        let imgh = this.naturalHeight
        let lg = fixh / imgh
        if (imgh > h * 2) {
            return
        }
        if (imgw * lg > fixw) {
            lg = fixw / imgw
        }
        $('#md').attr('style', 'filter:blur(2px);')
        let img = c('img')
        let curtain = c('div')
        curtain.style.height = getclienth() + 'px'
        curtain.style.width = getclientw() + 'px'
        adclass(curtain, 'curtain')
        img.src = this.src
        img.title = 'click to reduction'
        if (imgw > w) {
            img.style.width = '100%'
        }
        img.style.transform = 'scale(' + lg + ')'
        adclass(img, 'imglg')
        appendc(curtain, img)
        appendc($('body')[0], curtain)
        setTimeout(function() {
            img.style.opacity = 1
        }, 100);
        $(curtain).bind('click', function() {
            img.style.opacity = 0
            setTimeout(function() {
                $('.curtain').remove()
                $('#md').attr('style', '')
            }, 300);
        })
    })
}

function daybefore(pastdayjs) {
    let now = dayjs().set('hour', 0).set('minute', 0).set('second', 0)
    let before = now.diff(pastdayjs)
    before /= 3600000
    if (before < 24) {
        if (before > now.hour()) {
            return ' <x style="color:#46bbcd;">Yesterday</x>'
        } else {
            return ' <x style="color:#46bbcd;">Today</x>'
        }
    }
    if (before > 24 && before < 48) return ' <x style="color:#46bbcd;">2 days ago</x>'
    return Math.ceil(before / 24)
}

function articlecarddate(pastdayjs) {
    let daybeforers = daybefore(pastdayjs)
    let daynumber = parseInt(daybeforers)
    if (Number.isNaN(daynumber)) {
        return daybeforers
    } else {
        return ' <x style="color:#46bbcd;">' + daynumber + ' days ago</x>'
    }
}

function setarrow() {
    adclass(md, 'parrow')
    let arrows = $('.parrow h1, .parrow h2, .parrow h6, .parrow h3, .parrow h4, .parrow h5')
    arrows.addClass('panchor')
    arrows.addClass('unselectable')
    arrows.each(function(i, e) {
        let link = c('div')
        let headblock = c('div')
        link.innerText = '+'
        adclass(link, 'panchorlink')
        adclass(headblock, 'panchorheadblock')
        headblock.style.height = e.clientHeight + 'px';
        appendc(e, link)
        appendc(e, headblock)
        let url = location.origin + location.pathname + '?hash=' + encodeURI($(e)[0].id)
        $(e)[0].setAttribute('data-clipboard-text', url)
        new ClipboardJS(this).on('success', function(event) {
            popmsg('Copy link succeeded.')
            event.clearSelection();
        }).on('error', function(event) {
            popmsg('Copy link failed.')
            event.clearSelection();
        })
    })
    arrows.mouseover(function() {
        $(this).find('.panchorlink').css('opacity', '1')
    }).mouseout(function() {
        $(this).find('.panchorlink').css('opacity', '0')
    })
    $(window).scroll(function() {
        let stop = window.scrollY - 40
        let sbotton = (window.scrollY + getclienth(0.90))
        for (let i = 0; i < arrows.length; i++) {
            let ofs = arrows[i].offsetTop
            if (ofs >= stop && ofs <= sbotton) {
                if (arrows[i].inscreen === undefined || arrows[i].inscreen === false) {
                    arrows[i].inscreen = true
                    adclass(arrows[i], 'showarrow')
                }
            } else {
                if (arrows[i].inscreen === true) {
                    arrows[i].inscreen = false
                    rmclass(arrows[i], 'showarrow')
                }
            }
        }
    })
}

function showseries(abbrlink, ps, psname) {
    $('#articlehead').after(`
        <div id="series-btn" class="unselectable">Series of <span style="color:#6146cd">${psname}</span> (Click To Show All Articles)</div>
        <div id="seriesbox" class="unselectable"></div>
    `)
    let sb = $('#seriesbox')
    for (let i = 0; i < ps.length; i++) {
        let sadiv = c('div')
        let sa = c('span')
        let it = ps[i].split('===')
        sa.innerText = it[0]
        let sdate = c('div')
        sdate.innerHTML = articlecarddate(dayjs(Number(it[2])))
        adclass(sdate, 'sdate')
        appendc(sadiv, sa)
        appendc(sadiv, sdate)
        appendc(sb[0], sadiv)
        if (it[1] === abbrlink) {
            adclass(sadiv, 'adis')
        } else {
            $(sadiv).click(() => {
                location.href = location.origin + '/article/' + it[1] + '.html'
            })
        }
    }
    sb.css('height', $('#seriesbox').css('height'))
    sb.addClass('seboxhide')
    $('#series-btn').bind('click', function() {
        if (!hasclass(sb[0], 'seboxhide')) {
            adclass(sb[0], 'seboxhide')
        } else {
            rmclass(sb[0], 'seboxhide')
        }
    })
}

function md2png() {
    popmsg('processing...')
    setTimeout(function() {
        let opts = {
            async: false,
            useCORS: true,
            allowTaint: true,
            logging: false
        }
        html2canvas($('#md')[0], opts).then(function(canvas) {
            $('#png_box').html(canvas)
            $('#share_png_panel').removeClass('myhide')
            popmsg('done!')
        })
    }, 500);
}

function syncreihandle2metadata(rei) {
    let metadata = gethexofrontmatter(rei.body)
    if (metadata === undefined) {
        metadata = new Object()
        metadata.title = rei.title
        metadata.categories = new Array()
        metadata.categories.push('unclassfied')
        metadata.comments = true
        metadata.date = rei.created_at
        metadata = jsyaml.dump(metadata)
    }
    metadata = jsyaml.load(metadata)
    metadata.char_count = rei.body.length
    metadata.number = rei.number
    metadata.created_at = rei.created_at
    metadata.updated_at = rei.updated_at
    let body = getdocwithnohexofrontmatter(rei.body)
    let short = new Array()
    body = body.split(/\n/)
    for (let i = 0; i < shortmsgline; i++) {
        short.push(body[i])
    }
    while (short[0] === '\n') {
        short.shift()
    }
    let shortcontant = ''
    let codeparecount = 0
    let startpreindex = -1
    let endpreindex = -1
    for (let j = 0; j < short.length; j++) {
        if (short[j].search('```') === 0) {
            codeparecount++
        }
        let presi = short[j].search('<pre')
        let preei = short[j].search('</pre')
        startpreindex = presi !== -1 ? presi : startpreindex
        endpreindex = preei !== -1 ? preei : endpreindex
        shortcontant += short[j]
        shortcontant += '\n'
    }
    if (codeparecount % 2 !== 0) {
        shortcontant += '```'
        shortcontant += '\n'
    }
    if (startpreindex !== -1 && endpreindex < startpreindex) {
        for (let i = shortmsgline; endpreindex < startpreindex; i++) {
            if (i == 35) {
                shortcontant += '</pre>'
                shortcontant += '\n'
                break
            }
            endpreindex = body[i].search('</pre')
            shortcontant += body[i]
            shortcontant += '\n'
        }
    }
    metadata.short_contant = shortcontant.replace(/!\[.*\]\(.*\)/gm, '')
    return metadata
}

function handlemetadata(metadata) {
    let site_birthday = '2017-11-5'
    $('#stat_running').html('<x style="color:#494b78;">' + daybefore(dayjs(site_birthday)) + '</x> days')
    let totalchars = 0
    for (let i = 0; i < metadata.length; i++) {
        totalchars += metadata[i].char_count
        metadata[i].body = null
        if (metadata[i].tags !== undefined) {
            for (let j = 0; j < metadata[i].tags.length; j++) {
                metadata[i].tags[j] = metadata[i].tags[j]
            }
        }
        articlesmetadatahandle(metadata[i])
        // push for page articles to load the data
        articles_cache.push(metadata[i])
    }
    // display tags btn
    all_tags.sort()
    for (let i = 0; i < all_tags.length; i++) {
        tags.innerHTML += '<button class="stgt btn btn-light">' + all_tags[i] + '</button>'
    }
    // display cats btn
    all_cates.sort()
    for (let i = 0; i < all_cates.length; i++) {
        cates.innerHTML += '<button id="' + b64.encode(all_cates[i], true) + '_catetag" class="stgc btn btn-light">' + all_cates[i] + '</button>'
    }
    $('#stat_typein').html('<x style="color:#494b78;">' + (totalchars || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '</x> chars')
    $('#stat_article_count').html('<x style="color:#494b78;">' + (metadata.length || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '</x> articles')
    $('#stat_cate_count').html('<x style="color:#494b78;">' + (all_cates.length || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '</x> cates')
    $('#stat_tag_count').html('<x style="color:#494b78;">' + (all_tags.length || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') + '</x> tags')
    $('#stat_last_update').html('<x style="color:#494b78;">' + dayjs(Number(sessionStorage.getItem('cacheversion'))).format('MMM-DD-YYYY, HH:mm') + '</x>')
    rstopaging(metadata.sort(sortarticlebycreatedate))
    let stgts = $('.stgt')
    let stgcs = $('.stgc')
    for (let i = 0; i < stgcs.length; i++) {
        $(stgcs[i]).bind('click', function(event) {
            catetagclick(this, true)
        })
    }
    for (let i = 0; i < stgts.length; i++) {
        $(stgts[i]).bind('click', function(event) {
            filter_articles_cache = new Array()
            if (hasclass(this, 'btn-light')) {
                stgts.attr('disabled', true)
                stgcs.attr('disabled', true)
                $('.treenode div').addClass('adisable')
                rmclass(this, 'btn-light')
                this.disabled = false
                adclass(this, 'btn-info')
                for (let k = 0; k < metadata.length; k++) {
                    if (metadata[k].tags !== undefined) {
                        for (let l = 0; l < metadata[k].tags.length; l++) {
                            if (metadata[k].tags[l] === this.innerText) {
                                filter_articles_cache.push(metadata[k])
                            }
                        }
                    }
                }
            } else {
                stgts.attr('disabled', false)
                stgcs.attr('disabled', false)
                $('.treenode div').removeClass('adisable')
                rmclass(this, 'btn-info')
                adclass(this, 'btn-light')
            }
            filter()
        })
    }
    setTimeout(() => {
        rmclass(docpanel, 'myhide')
        adclass(docpanel, 'myshow')
    }, 100)
    rmclass(articles_side_panel, 'myhide')
    adclass(articles_side_panel, 'myshow')
    $('#blog_statistic_body').removeClass('myhide')
}

function seriesorderhandle(abbrlink, psname, sbody, obody) {
    if (psname !== undefined) {
        let ses = jsyaml.load(sbody)
        for (let i = 0; i < ses.length; i++) {
            if (ses[i].se === psname) {
                showseries(abbrlink, ses[i].ps, psname)
                break
            }
        }
    }
    let articleorder = obody.split('>--<')
    let preindex
    let nextindex
    articleorder.find(function(now, nowindex) {
        if (now === document.title + '<=>' + abbrlink) {
            preindex = nowindex - 1
            nextindex = nowindex + 1
            return true
        }
    })

    if (preindex === -1) {
        $('#nextarticlebtn').removeClass('btn-dark')
        $('#nextarticlebtn').addClass('btn-secondary disabled')
    } else {
        $('#nextarticlebtn').removeClass('disabled')
        let prearr = articleorder[preindex].split('<=>')
        let pretitle = prearr[0]
        let preabbrlink = prearr[1]
        $('#nextarticlebtn').attr('data-original-title', pretitle)
        $('#nextarticlebtn').click(function() {
            location = '/article/' + preabbrlink + '.html'
        })
        setTimeout(() => {
            $('#nextarticlebtn').tooltip('show')
        }, 500);
    }
    if (nextindex === articleorder.length) {
        $('#prearticlebtn').removeClass('btn-dark')
        $('#prearticlebtn').addClass('btn-secondary disabled')
    } else {
        $('#prearticlebtn').removeClass('disabled')
        let nextarr = articleorder[nextindex].split('<=>')
        let nexttitle = nextarr[0]
        let nextabbrlink = nextarr[1]
        $('#prearticlebtn').attr('data-original-title', nexttitle)
        $('#prearticlebtn').click(function() {
            location = '/article/' + nextabbrlink + '.html'
        })
        setTimeout(() => {
            $('#prearticlebtn').tooltip('show')
        }, 500)
    }
}

function setcleancachedbtncolor(set) {
    setTimeout(function() {
        $('#cleancache').removeClass()
        $('#cleancache').addClass('mt-2 btn btn-' + set)
    }, 500);
}

function checkcache() {
    let pcbl_timeout = localStorage.getItem('pcbl_timeout')
    if (pcbl_timeout === null && pcbl_timeout === undefined) {
        setcleancachedbtncolor('dark')
    } else {
        let pcbl_timeout_int = parseInt(pcbl_timeout)
        let flash = dayjs(pcbl_timeout_int).diff(dayjs()) / 3600000
        if (flash > 22 && flash < 24) {
            setcleancachedbtncolor('success')
        } else if (flash > 16 && flash < 22) {
            setcleancachedbtncolor('info')
        } else if (flash > 10 && flash < 16) {
            setcleancachedbtncolor('warning')
        } else {
            setcleancachedbtncolor('danger')
        }
    }
}

function jumpToAnchor() {
    let hash = '[href="' + decodeURI(location.hash) + '"]'
    setTimeout(function() {
        $('.markdown-toc').find(hash).click()
    }, 1000);
}

function getmetadatafromabbrlink(abbrlink) {
    let articlesMetadate = jsyaml.load(sessionStorage.getItem('pcbl'))
    return articlesMetadate.find((v) => {
        return v.abbrlink === abbrlink
    })
}

function scriptblock() {

    $('p').each((i, e) => {
        if (e.innerText.trim() === '') {
            $(e).remove()
        }
    })
    $('#md script').remove()
    let cd = $('#md').children()
    let h3p
    let bhtml = ''
    function wrapblock() {
        $(`[_script_block=${h3p.id}]`).remove()
        $(h3p).after(`
            <sb class="hide-script-block" id="_sb_${h3p.id}">
                ${bhtml}
            </sb>
        `)
    }
    cd.each((i, e) => {
        if (e.tagName === 'H3') {
            if (bhtml !== '') {
                wrapblock()
            }
            bhtml = ''
            h3p = e
        } else if (e.tagName !== 'H2') {
            if (h3p !== undefined) {
                let ee = $(e)
                ee.attr('_script_block', h3p.id)
                bhtml += e.outerHTML
            }
        }
    })
    wrapblock()
}

function getScriptsHtm(secondHeader) {
    $.ajax({
        type: 'get',
        url: `/scripts/${secondHeader}.htm?hot=${sessionStorage.getItem('cacheversion')}`,
        success: (rs) => {
            $('#md').append(rs)
        }
    })
}

function get_friendlinked() {
    let keys = Object.keys(friendslink)
    for (key of keys) {
        let ditem = c('a')
        adclass(ditem, 'dropdown-item')
        ditem.href = friendslink[key]
        ditem.target = '_blank'
        ditem.innerText = key.replace(/\n|\r\n/g, '')
        appendc(fldd, ditem)
    }
}